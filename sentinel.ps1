<#
  sentinel.ps1 - FIXED SYNTAX version (PowerShell 5.1 compatible)
  Save to file and run: powershell -ExecutionPolicy Bypass -File .\sentinel.ps1
#>
# ---------- AUTO-LOAD .env ----------
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {   
        if ($_ -match '^\s*([^#=]+)=(.*)$') {
            $key = $matches[1].Trim()       
            $value = $matches[2].Trim()     
            Set-Item -Path "env:$key" -Value $value
        }
    }
    Write-Host "✅ Loaded .env file" -ForegroundColor Green
} else {
    Write-Warning "⚠️ .env file not found - using defaults"
}

# ---------- CONFIGURATION with safe defaults ----------

$RpcBase = $env:RPC_BASE_URL
if (-not $RpcBase -or $RpcBase.Trim() -eq "") { $RpcBase = "https://rpc.qubic.org/" }
$RpcBase = $RpcBase.TrimEnd('/') + '/'

# parse polling interval safely, fallback default 5000ms
$rawPoll = $env:POLL_INTERVAL_MS
[int]$PollIntervalMs = 0
if ($rawPoll) {
  try { $PollIntervalMs = [int]::Parse($rawPoll) } catch { $PollIntervalMs = 5000 }
} else { $PollIntervalMs = 5000 }

if ($PollIntervalMs -lt 100) { $PollIntervalMs = 5000 }

# Whale threshold
[int]$WhaleThreshold = 5000
if ($env:WHALE_THRESHOLD_QU) {
  try { $WhaleThreshold = [int]::Parse($env:WHALE_THRESHOLD_QU) } catch {}
}

$EasyConnectWebhook = $env:EASYCONNECT_WEBHOOK_URL
$SourceFilter = $env:SOURCE_FILTER
$DestFilter   = $env:DEST_FILTER

[int]$RecentLimit = 200
if ($env:RECENT_ALERTS_LIMIT) {
  try { $RecentLimit = [int]::Parse($env:RECENT_ALERTS_LIMIT) } catch {}
}

Write-Host "RPC Base: $RpcBase"
Write-Host "Poll Interval (ms): $PollIntervalMs"
Write-Host "Whale threshold: $WhaleThreshold"
if ($EasyConnectWebhook) { Write-Host "Webhook: configured" } else { Write-Host "No webhook configured" }

# ---------- state ----------
$processedTicks = [System.Collections.Generic.HashSet[int]]::new()
$recentAlerts = [System.Collections.Generic.List[PSObject]]::new()
$lastProcessedTick = 0

function Safe-Sleep([int]$ms) {
  if (-not $ms -or $ms -lt 0) { $ms = 1000 }
  Start-Sleep -Milliseconds $ms
}

function Send-Webhook {
  param($payload)
  if (-not $EasyConnectWebhook) { return $false }
  try {
    $json = $payload | ConvertTo-Json -Depth 8
    Invoke-RestMethod -Uri $EasyConnectWebhook -Method Post -Body $json -ContentType 'application/json' -TimeoutSec 10
    return $true
  } catch {
    Write-Warning ("[webhook] failed: {0}" -f $_.Exception.Message)
    return $false
  }
}

function Push-Alert { 
  param($a)
  $recentAlerts.Insert(0, $a)
  while ($recentAlerts.Count -gt $RecentLimit) { $recentAlerts.RemoveAt($recentAlerts.Count -1) }
}

function Evaluate-Tx { 
  param($tx)
  [long]$amount = 0
  if ($null -ne $tx) {
    if ($tx.PSObject.Properties['amount']) {
      try { $amount = [long]$tx.amount } catch {}
    } elseif ($tx.PSObject.Properties['value']) {
      try { $amount = [long]$tx.value } catch {}
    } elseif ($tx -is [string]) {
      try { $amount = [long]$tx } catch {}
    }
  }

  $from = $null; $to = $null; $txid = $null
  try { $from = $tx.sourceId } catch {}
  try { $to   = $tx.destId } catch {}
  try { $txid = $tx.txId } catch {}

  $match = $false
  if ($amount -ge $WhaleThreshold) { $match = $true }

  if (-not $match -and $SourceFilter -and $from) {
    try { if ([regex]::IsMatch($from, $SourceFilter, 'IgnoreCase')) { $match = $true } } catch { if ($from -like "*$SourceFilter*") { $match = $true } }
  }
  if (-not $match -and $DestFilter -and $to) {
    try { if ([regex]::IsMatch($to, $DestFilter, 'IgnoreCase')) { $match = $true } } catch { if ($to -like "*$DestFilter*") { $match = $true } }
  }

  if ($match) {
    return @{
      match = $true
      amount = $amount
      from = $from
      to = $to
      txId = $txid
      raw = $tx
    }
  } else {
    return @{ match = $false }
  }
}

# ---------- main loop ----------
$backoffMs = 0
while ($true) {
  try {
    # Get current status FIRST to validate ticks
    $status = Invoke-RestMethod -Uri ("{0}v1/status" -f $RpcBase) -ErrorAction Stop
    $lastProcessedTick = if ($status.lastProcessedTick.tickNumber) { $status.lastProcessedTick.tickNumber } else { 0 }
    Write-Host "Last processed tick: $lastProcessedTick" -ForegroundColor Green

    # Get current tick from tick-info
    $tickInfo = Invoke-RestMethod -Uri ("{0}v1/tick-info" -f $RpcBase) -Method Get -ErrorAction Stop
    $tick = $null
    if ($tickInfo -is [System.Collections.Hashtable] -and $tickInfo.ContainsKey('tick')) { 
      $tick = $tickInfo.tick 
    } elseif ($tickInfo.tickInfo -and $tickInfo.tickInfo.tick) { 
      $tick = $tickInfo.tickInfo.tick 
    }

    if (-not $tick) {
      Write-Warning "No tick from tick-info"
      Safe-Sleep -ms $PollIntervalMs
      continue
    }

    # CRITICAL: Skip if tick too recent (400/404 protection)
    if ($tick -gt ($lastProcessedTick + 100)) {
      Write-Warning "Tick $tick too recent (waiting for $lastProcessedTick)"
      Safe-Sleep -ms $PollIntervalMs
      continue
    }

    if (-not $processedTicks.Contains([int]$tick)) {
      Write-Host "Processing finalized tick $tick (last: $lastProcessedTick)" -ForegroundColor Cyan

      # Try V2 first (more reliable), then V1 fallbacks
      $txsResponse = $null
      $endpoints = @(
        "{0}v2/ticks/{1}/transactions",
        "{0}v1/ticks/{1}/transactions",
        "{0}v1/ticks/{1}"
      )
      
      foreach ($endpoint in $endpoints) {
        try {
          $txsResponse = Invoke-RestMethod -Uri ($endpoint -f $RpcBase, $tick) -Method Get -ErrorAction Stop
          Write-Host "✓ Success via: $endpoint" -ForegroundColor Green
          break
        } catch {
          Write-Verbose ("Failed $endpoint`: $($_.Exception.Message)")
        }
      }

      if (-not $txsResponse) {
        Write-Warning "All endpoints failed for tick $tick - skipping"
        $processedTicks.Add([int]$tick) | Out-Null
        continue
      }

      # Robust normalization
      $txs = @()
      if ($null -eq $txsResponse) {
        $txs = @()
      } elseif ($txsResponse -is [System.Collections.Hashtable] -and $txsResponse.ContainsKey('transactions') -and $txsResponse.transactions -ne $null) {
        $txs = $txsResponse.transactions
      } elseif ($txsResponse -is [System.Collections.Hashtable] -and $txsResponse.ContainsKey('txs') -and $txsResponse.txs -ne $null) {
        $txs = $txsResponse.txs
      } elseif ($txsResponse -is [System.Array]) {
        $txs = $txsResponse
      } elseif ($txsResponse -is [System.Collections.Hashtable]) {
        $arrProp = $txsResponse.PSObject.Properties | Where-Object { $_.Value -is [System.Array] } | Select-Object -First 1
        if ($arrProp -and $arrProp.Value) {
          $txs = $arrProp.Value
        } else {
          $txs = @($txsResponse)
        }
      } elseif ($txsResponse -is [PSCustomObject] -or $txsResponse -is [System.Management.Automation.PSObject]) {
        $txs = @($txsResponse)
      } else {
        $txs = @()
      }

      if ($txs -isnot [System.Array]) { $txs = @($txs) }
      $txs = $txs | Where-Object { $_ -ne $null }

      Write-Host "Found $($txs.Count) transaction(s) for tick $tick" -ForegroundColor Yellow

      foreach ($tx in $txs) {
        if ($null -eq $tx) { continue }
        if (($tx -is [string] -or $tx -is [int] -or $tx -is [long]) -and ($tx -notmatch '"')) {
          continue
        }

        $eval = Evaluate-Tx -tx $tx
        if ($eval.match) {
          $alert = [PSCustomObject]@{
            kind = 'whale_or_filter_match'
            txId = $eval.txId
            from = $eval.from
            to = $eval.to
            amount = $eval.amount
            tick = $tick
            time = (Get-Date).ToString("o")
          }
          
          # FIXED: Separate Write-Host calls for colors
          Write-Host "[ALERT] $($alert.amount) QU - $($alert.from) -> $($alert.to) (tx: $($alert.txId))" -ForegroundColor Red -BackgroundColor Black
          Push-Alert -a $alert

          $payload = @{
            kind = $alert.kind
            txId = $alert.txId
            from = $alert.from
            to = $alert.to
            amount = $alert.amount
            tick = $alert.tick
            time = $alert.time
          }
          Send-Webhook -payload $payload | Out-Null
        }
      }

      $processedTicks.Add([int]$tick) | Out-Null

      if ($processedTicks.Count -gt 20000) {
        $toRemove = $processedTicks | Select-Object -First 500
        foreach ($x in $toRemove) { $processedTicks.Remove($x) | Out-Null }
      }
    }

    $backoffMs = 0
  } catch {
    Write-Warning ("Polling error: {0}" -f $_.Exception.Message)
    if ($backoffMs -eq 0) { $backoffMs = 1000 } else { $backoffMs = [math]::Min(30000, $backoffMs * 2) }
    Write-Host "Backing off for $backoffMs ms" -ForegroundColor Magenta
    Safe-Sleep -ms $backoffMs
  }

  Safe-Sleep -ms $PollIntervalMs
}
