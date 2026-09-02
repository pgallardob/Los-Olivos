# Estado del hosting administrable.cl — sin riesgo de baneo
# Muestra: baneo de IP (puertos) + UNA unica prueba de login FTP.
$ftpHost = '136.243.227.82'
$user = 'yftqrecu'
$pass = 'x6j5t9U3Iz'

Write-Host '=== Hosting administrable.cl (136.243.227.82) ==='

$p21 = Test-NetConnection $ftpHost -Port 21 -InformationLevel Quiet -WarningAction SilentlyContinue
$p443 = Test-NetConnection $ftpHost -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
$p2003 = Test-NetConnection $ftpHost -Port 2003 -InformationLevel Quiet -WarningAction SilentlyContinue

Write-Host ("Puerto 21 (FTP):     " + $(if ($p21) { 'ABIERTO' } else { 'CERRADO - baneo activo' }))
Write-Host ("Puerto 443 (web):    " + $(if ($p443) { 'ABIERTO' } else { 'CERRADO - baneo activo' }))
Write-Host ("Puerto 2003 (panel): " + $(if ($p2003) { 'ABIERTO' } else { 'CERRADO - baneo activo' }))

if ($p21) {
    try {
        $req = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost/")
        $req.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $req.Timeout = 20000
        $resp = $req.GetResponse()
        $resp.Close()
        Write-Host 'LOGIN FTP: OK - credenciales validas. LISTO PARA DEPLOY (deploy-ftp.ps1)' -ForegroundColor Green
    } catch {
        $msg = $_.Exception.Message
        if ($msg -match '530') {
            Write-Host 'LOGIN FTP: RECHAZADO (530) - credenciales invalidas, pedir nuevas a soporte@administrable.cl' -ForegroundColor Red
        } else {
            Write-Host "LOGIN FTP: ERROR inesperado - $msg" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host 'No se probo login FTP: puerto cerrado (baneo). Esperar o pedir desbloqueo a soporte.'
}
