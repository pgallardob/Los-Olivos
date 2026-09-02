$ErrorActionPreference = 'Continue'
# Deploy FTP — hosting administrable.cl (Webuzo)
# IMPORTANTE: sin reintentos. Los reintentos con credenciales invalidas
# provocan el bloqueo de IP por el firewall del hosting (ya ocurrio una vez).
$ftpHost = '136.243.227.82'
$user = 'yftqrecu'
$pass = 'Patricioagb1#'
$localDir = 'C:\Users\pc\landing-futurista\dist'

# 1. Verificar conectividad ANTES de intentar login (evita agravar un baneo)
$portOpen = Test-NetConnection $ftpHost -Port 21 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $portOpen) {
    Write-Host 'PUERTO 21 CERRADO: la IP esta bloqueada por el hosting.' -ForegroundColor Red
    Write-Host 'NO reintentar: cada intento de login fallido extiende el baneo.' -ForegroundColor Red
    Write-Host 'Solucion: soporte@administrable.cl (desbloquear IP 186.189.106.174 + verificar credenciales FTP).'
    exit 1
}

# 2. Probar login UNA sola vez antes de subir archivos
try {
    $probe = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost/")
    $probe.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $probe.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
    $probe.Timeout = 20000
    $probeResp = $probe.GetResponse()
    $probeResp.Close()
    Write-Host 'Login FTP OK - credenciales validas' -ForegroundColor Green
} catch {
    $msg = $_.Exception.Message
    if ($msg -match '530') {
        Write-Host 'LOGIN RECHAZADO (530): credenciales invalidas. Deteniendo TODO para no provocar otro baneo.' -ForegroundColor Red
        Write-Host 'Solucion: pedir credenciales FTP vigentes a soporte@administrable.cl y actualizar este script.'
        exit 2
    }
    Write-Host "Login FTP con error inesperado: $msg - se intenta el deploy igual." -ForegroundColor Yellow
}

# 3. Subir archivos (un solo intento por archivo)
$files = Get-ChildItem $localDir -Recurse | Where-Object { -not $_.PSIsContainer }
$total = $files.Count
$i = 0
$authFailed = $false

foreach ($f in $files) {
    if ($authFailed) { break }
    $i++
    $relPath = $f.FullName.Substring($localDir.Length + 1).Replace('\','/')
    $ftpPath = "ftp://$ftpHost/public_html/$relPath"

    try {
        $req = [System.Net.FtpWebRequest]::Create($ftpPath)
        $req.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $req.UseBinary = $true
        $req.KeepAlive = $true
        $req.Timeout = 60000
        $req.ReadWriteTimeout = 60000
        $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
        $req.ContentLength = $bytes.Length
        $s = $req.GetRequestStream()
        $s.Write($bytes, 0, $bytes.Length)
        $s.Close()
        $resp = $req.GetResponse()
        $resp.Close()
        Write-Host "[$i/$total] OK: $relPath" -ForegroundColor Green
    } catch {
        $msg = $_.Exception.Message
        if ($msg -match '530') {
            Write-Host "[$i/$total] 530 LOGIN RECHAZADO a mitad del deploy: deteniendo todo." -ForegroundColor Red
            $authFailed = $true
        } else {
            Write-Host "[$i/$total] ERROR: $relPath - $msg" -ForegroundColor Yellow
        }
    }
}
Write-Host "`nFIN: $i de $total archivos procesados"
if ($authFailed) { exit 2 }
