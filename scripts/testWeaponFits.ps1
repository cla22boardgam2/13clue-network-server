Add-Type -AssemblyName System.Drawing

function RotateAndFit(
    [string]$srcPath,
    [string]$dstPath,
    [float]$angle = 0,
    [float]$scale = 1.0,
    [int]$offsetX = 0,
    [int]$offsetY = 0,
    [System.Drawing.Color]$bgColor,
    [int]$targetW = 400,
    [int]$targetH = 600
) {
    $srcImg = [System.Drawing.Image]::FromFile($srcPath)
    $dstBmp = New-Object System.Drawing.Bitmap $targetW, $targetH
    $g = [System.Drawing.Graphics]::FromImage($dstBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.Clear($bgColor)

    # Move origin to center of destination + offset
    $g.TranslateTransform(($targetW / 2.0) + $offsetX, ($targetH / 2.0) + $offsetY)
    $g.RotateTransform($angle)

    $w = $srcImg.Width * $scale
    $h = $srcImg.Height * $scale
    $g.DrawImage($srcImg, -$w / 2.0, -$h / 2.0, $w, $h)

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]88)

    $dstBmp.Save($dstPath, $encoder, $encoderParams)

    $g.Dispose()
    $dstBmp.Dispose()
    $srcImg.Dispose()
    Write-Output "Saved: $dstPath"
}

# 1. Wrench: rotate 90 degrees so handle is bottom, jaw is top
# source width ~2000, height ~800
RotateAndFit "scratch/candidates/w-wrench_last2.jpg" "scratch/candidates/test_wrench_rot.jpg" 90 0.28 0 0 ([System.Drawing.Color]::FromArgb(60, 40, 25))

# 2. Pistol: Colt 1851 Navy revolver (w-pistol_1.jpg) rotated -40 degrees on black
RotateAndFit "scratch/candidates/w-pistol_1.jpg" "scratch/candidates/test_pistol_rot.jpg" -40 0.18 0 0 ([System.Drawing.Color]::Black)

# 3. Rifle: Enfield 1853 (w-rifle_2.png) rotated -55 degrees on black
RotateAndFit "scratch/candidates/w-rifle_2.png" "scratch/candidates/test_rifle_rot.jpg" -55 0.35 0 0 ([System.Drawing.Color]::Black)
