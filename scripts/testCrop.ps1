Add-Type -AssemblyName System.Drawing

function CropAndResize([string]$srcPath, [string]$dstPath, [double]$cropXRatio, [double]$cropYRatio, [double]$cropWRatio, [double]$cropHRatio, [int]$targetW = 400, [int]$targetH = 600) {
    $srcImg = [System.Drawing.Image]::FromFile($srcPath)
    $srcW = $srcImg.Width
    $srcH = $srcImg.Height

    $srcCropX = [int]($srcW * $cropXRatio)
    $srcCropY = [int]($srcH * $cropYRatio)
    $srcCropW = [int]($srcW * $cropWRatio)
    $srcCropH = [int]($srcH * $cropHRatio)

    $dstBmp = New-Object System.Drawing.Bitmap $targetW, $targetH
    $g = [System.Drawing.Graphics]::FromImage($dstBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $srcRect = New-Object System.Drawing.Rectangle $srcCropX, $srcCropY, $srcCropW, $srcCropH
    $dstRect = New-Object System.Drawing.Rectangle 0, 0, $targetW, $targetH

    $g.DrawImage($srcImg, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)

    $dstBmp.Save($dstPath, $encoder, $encoderParams)

    $g.Dispose()
    $dstBmp.Dispose()
    $srcImg.Dispose()
    Write-Output "Saved: $dstPath ($((Get-Item $dstPath).Length) bytes)"
}

# Crop rope cand1: lower half centered on coil
CropAndResize "scratch/candidates/w-rope_cand1.jpg" "scratch/candidates/test_rope_crop.jpg" 0.15 0.50 0.70 0.48 400 600

# Crop bomb orsini: centered on sphere
CropAndResize "scratch/candidates/w-bomb_orsini.jpg" "scratch/candidates/test_bomb_orsini.jpg" 0.15 0.05 0.70 0.90 400 600

# Crop bomb 17th grenades: centered on middle 2 grenades
CropAndResize "scratch/candidates/w-bomb_17th_grenades.jpg" "scratch/candidates/test_bomb_grenades.jpg" 0.22 0.35 0.45 0.45 400 600
