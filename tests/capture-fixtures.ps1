# Refreshes tests/fixtures/*.json from the live Open Food Facts v2 API.
# Run deliberately when the API payload shape may have changed:
#   pwsh -File tests/capture-fixtures.ps1
# Only the fields the app reads are kept, with real key variants preserved.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$headers = @{ 'User-Agent' = 'Simple-Nutrition-Scanner/1.2.0 (ingestion-fixture-capture)' }

$targets = @(
    @{ code = '3017620422003'; file = 'nutella.json' },
    @{ code = '20724696';      file = 'organic-almonds.json' }
)

foreach ($t in $targets) {
    $raw = (Invoke-WebRequest -Uri "https://world.openfoodfacts.org/api/v2/product/$($t.code).json" -Headers $headers -TimeoutSec 40).Content
    $r = $raw | ConvertFrom-Json
    $p = $r.product

    $keep = [ordered]@{}
    foreach ($k in @('nutriscore_grade','nutriscore_score','nova_group','ecoscore_grade','additives_tags','labels_tags','nutrient_levels')) {
        if ($null -ne $p.$k) { $keep[$k] = $p.$k }
    }

    # keep only the nutriments the app actually reads, preserving the real API key variants
    $wanted = @('sugars','salt','sodium','fat','saturated-fat','energy-kcal','energy-kj','energy')
    $nutriments = [ordered]@{}
    foreach ($prop in $p.nutriments.PSObject.Properties) {
        $base = ($prop.Name -replace '_(100g|prepared_100g|serving|value|unit|modifier)$','')
        if ($wanted -contains $base) { $nutriments[$prop.Name] = $prop.Value }
    }

    $envelope = [ordered]@{
        status                    = $r.status
        status_verbose            = $r.status_verbose
        code                      = $r.code
        product                   = [ordered]@{
            code                 = $p.code
            product_name         = $p.product_name
            brands               = $p.brands
            image_front_url      = $p.image_front_url
            ingredients_text_en  = $p.ingredients_text_en
            nutriments           = $nutriments
        }
    }
    foreach ($k in $keep.Keys) { $envelope.product[$k] = $keep[$k] }

    $json = $envelope | ConvertTo-Json -Depth 20
    Set-Content -Path (Join-Path $root "tests\fixtures\$($t.file)") -Value $json -Encoding utf8
    "wrote $($t.file) ($($json.Length) chars)"
}

# the not-found envelope shape used by the v2 API
$nf = '{"status":0,"status_verbose":"no code found in the database","code":"9999999999999"}'
Set-Content -Path (Join-Path $root 'tests\fixtures\not-found.json') -Value $nf -Encoding utf8
'wrote not-found.json'
