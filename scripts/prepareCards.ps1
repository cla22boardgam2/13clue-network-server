Add-Type -AssemblyName System.Drawing

$outDir = "scratch/final_cards"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

function ProcessCard(
    [string]$id,
    [string]$srcPath,
    [double]$focusX = 0.5, # 0.0 (left) to 1.0 (right)
    [double]$focusY = 0.5, # 0.0 (top) to 1.0 (bottom)
    [double]$zoom = 1.0,   # > 1.0 means zoom in on subject
    [int]$targetW = 400,
    [int]$targetH = 600
) {
    if (!(Test-Path $srcPath)) {
        Write-Error "Source file missing: $srcPath"
        return
    }

    $srcImg = [System.Drawing.Image]::FromFile($srcPath)
    $srcW = $srcImg.Width
    $srcH = $srcImg.Height

    # Target aspect ratio is 2:3 (width/height = 2/3)
    $targetAspect = [double]$targetW / [double]$targetH

    # Calculate crop box that matches target aspect ratio
    # If source is wider than 2:3, height is the constraining dimension
    if (($srcW / $srcH) -gt $targetAspect) {
        $cropH = $srcH / $zoom
        $cropW = $cropH * $targetAspect
    } else {
        $cropW = $srcW / $zoom
        $cropH = $cropW / $targetAspect
    }

    # Position the crop box based on focusX and focusY
    $cropX = ($srcW * $focusX) - ($cropW / 2.0)
    $cropY = ($srcH * $focusY) - ($cropH / 2.0)

    # Clamp bounds inside source image
    if ($cropX -lt 0) { $cropX = 0 }
    if ($cropY -lt 0) { $cropY = 0 }
    if (($cropX + $cropW) -gt $srcW) { $cropX = $srcW - $cropW }
    if (($cropY + $cropH) -gt $srcH) { $cropY = $srcH - $cropH }

    $dstBmp = New-Object System.Drawing.Bitmap $targetW, $targetH
    $g = [System.Drawing.Graphics]::FromImage($dstBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $srcRect = New-Object System.Drawing.Rectangle ([int]$cropX), ([int]$cropY), ([int]$cropW), ([int]$cropH)
    $dstRect = New-Object System.Drawing.Rectangle 0, 0, $targetW, $targetH

    $g.DrawImage($srcImg, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)

    $dstPath = Join-Path $outDir "$id.jpg"
    $dstBmp.Save($dstPath, $encoder, $encoderParams)

    $g.Dispose()
    $dstBmp.Dispose()
    $srcImg.Dispose()

    $len = (Get-Item $dstPath).Length
    Write-Output "✓ Processed $id -> $dstPath ($len bytes)"
}

# 1. l-dock (선착장) - Grimshaw's Humber Docks Hull
ProcessCard "l-dock" "scratch/dock_test.jpg" 0.5 0.5 1.0

# 2. l-alley (골목길) - Grimshaw's Blackman Street
ProcessCard "l-alley" "scratch/candidates/l-alley_0.jpg" 0.5 0.5 1.0

# 3. l-park (공원) - Grimshaw's Moonlight Roundhay Park
ProcessCard "l-park" "scratch/candidates/l-park_2.jpg" 0.5 0.5 1.0

# 4. l-market (시장) - Levin's Covent Garden Market
ProcessCard "l-market" "scratch/candidates/l-market_cand0.jpg" 0.45 0.5 1.0

# 5. l-cemetery (공동묘지) - Friedrich's Graveyard under Snow
ProcessCard "l-cemetery" "scratch/candidates/l-cemetery_0.jpg" 0.5 0.5 1.0

# 6. l-ballroom (무도회장) - Tissot's The Ball
ProcessCard "l-ballroom" "scratch/candidates/l-ballroom_0.jpg" 0.5 0.5 1.0

# 7. l-greenhouse (온실) - Kew Gardens Palm House
ProcessCard "l-greenhouse" "scratch/candidates/l-greenhouse_0.jpg" 0.5 0.4 1.1

# 8. l-cellar (지하실) - Stone vaulted cellar
ProcessCard "l-cellar" "scratch/candidates/l-cellar_cand0.jpg" 0.5 0.5 1.0

# 9. l-museum (박물관) - Morse's Gallery of the Louvre
ProcessCard "l-museum" "scratch/candidates/l-museum_last0.jpg" 0.5 0.5 1.0

# 10. w-pistol (권총) - Met's Cased Colt 1860 Revolver
ProcessCard "w-pistol" "scratch/candidates/w-pistol_0.jpg" 0.5 0.5 1.0

# 11. w-rifle (소총) - Enfield 1853 Rifle
ProcessCard "w-rifle" "scratch/candidates/w-rifle_2.png" 0.5 0.5 1.0

# 12. w-dagger (단검) - Met's steel dagger
ProcessCard "w-dagger" "scratch/candidates/w-dagger_cand1.jpg" 0.5 0.5 1.0

# 13. w-poison (독약) - Victorian apothecary poison bottle
ProcessCard "w-poison" "scratch/candidates/w-poison_cand0.jpg" 0.5 0.5 1.0

# 14. w-axe (도끼) - Hand forged axe
ProcessCard "w-axe" "scratch/candidates/w-axe_cand0.jpg" 0.5 0.5 1.0

# 15. w-wrench (스패너) - 19th c monkey wrench
ProcessCard "w-wrench" "scratch/candidates/w-wrench_last2.jpg" 0.5 0.5 1.0

# 16. w-club (몽둥이) - Victorian police truncheon
ProcessCard "w-club" "scratch/candidates/w-club_last2.jpg" 0.5 0.5 1.0

# 17. w-rope (밧줄) - Coiled ship rope on deck (focus on bottom coil)
ProcessCard "w-rope" "scratch/candidates/w-rope_cand1.jpg" 0.5 0.75 1.4

# 18. w-bomb (폭탄) - Felice Orsini spherical bomb
ProcessCard "w-bomb" "scratch/candidates/w-bomb_orsini.jpg" 0.5 0.5 1.0
