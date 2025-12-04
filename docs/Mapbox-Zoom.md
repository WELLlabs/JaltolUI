# Mapbox Custom Zoom Extent
Mapbox by default on uploading GeoJSON via studio doesnot generate tiles with zoom below z9.

Mapbox suggested to take a look documentation on how to adjust zoom extent [here](https://docs.mapbox.com/help/troubleshooting/adjust-tileset-zoom-extent/).

## Method 1 (Failed)
### Transform data with Tippecanoe
1. Use Tippecanoe to convert GeoJSON to mbtiles specifying zoom extent (converted in Google Cloud Shell)
```bash
tippecanoe -o output.mbtiles -Z 4 -z 15 input.geojson
```
2. The transform was successful with message `*** NOTE TILES ONLY COMPLETE THROUGH ZOOM 7 ***`
3. Upload the mbtiles to mapbox studio
4. The upload was unsuccessful with the following error
<img width="280" height="175" alt="mapbox mbtiles error" src="https://github.com/user-attachments/assets/3a5fbdc9-3e49-4ed5-9c8e-e815a52f2635" />

## Method 2
### Mapbox Tiling Service
You will require Mapbox API Token for this method. use `jaltol-upload` token which has required `tilesets:write` permission enabled.
1. On several retries found that MTS has issues with GeoJSON formatted as such from the QGIS export. Use `jq` to convert geojson to ldgeojson
```bash
jq -c '.features[]' input.geojson > output.ldgeojson
```
if jq is not installed use `sudo apt install jq`

2. we need to create the tileset source, POST request to the following API endpoint uploading the .ldgeojson file attached to request body
```
https://api.mapbox.com/tilesets/v1/sources/{username}/{id}
```
3. create a recipe JSON mentioning the min and max zoom extents
```JSON
{
  "version": 1,
  "layers": {
    "layer": {
      "source": "mapbox://tileset-source/{username}/{tileset-source-id}",
      "minzoom": 4,
      "maxzoom": 15
    }
  }
}
```
4. next step is to create the tileset, POST request to the following API endpoint with recipe JSON attached to the request body
```
https://api.mapbox.com/tilesets/v1/{tileset_id}
```
5. Finally, Publish the tileset, POST request to the following API endpoint
```
https://api.mapbox.com/tilesets/v1/{tileset_id}/publish
```
6. You can see the tileset processing in the studio, once processing is completed the tileset becomes available for use in data manager

Bash script to make this process simple, `upload_mapbox.sh`
```bash
#!/usr/bin/env bash
set -e

############################################
# CONFIGURATION — EDIT THESE FOUR VALUES
############################################

USERNAME=""
TILESET_SOURCE_ID="karnataka_ci_zoom"           # Example: tamilnadu_roads_src
TILESET_ID=""                  			# Final ID becomes USERNAME.TILESET_ID
GEOJSON_FILE=""     				# Absolute or relative path
MAPBOX_TOKEN=""  				# Must include tilesets:write scope
############################################


echo "==== Step 1: Uploading GeoJSON as a tileset source ===="

UPLOAD_RESPONSE=$(curl -s -X POST \
  "https://api.mapbox.com/tilesets/v1/sources/${USERNAME}/${TILESET_SOURCE_ID}?access_token=${MAPBOX_TOKEN}" \
  -F file=@"${GEOJSON_FILE}" \
  --header "Content-Type: multipart/form-data")

echo "Upload response:"
echo "$UPLOAD_RESPONSE"
echo "--------------------------------------------------------"

SOURCE_URI="mapbox://tileset-source/${USERNAME}/${TILESET_SOURCE_ID}"

echo "Tileset source created: $SOURCE_URI"
echo


#####################################################################
# Step 2: Create temporary recipe.json with minzoom 4, maxzoom 15
#####################################################################

echo "==== Step 2: Creating recipe.json with custom zoom extent ===="

cat <<EOF > recipe.json
{
  "version": 1,
  "layers": {
    "layer": {
      "source": "${SOURCE_URI}",
      "minzoom": 4,
      "maxzoom": 15
    }
  }
}
EOF

echo "recipe.json created:"
cat recipe.json
echo "--------------------------------------------------------"
echo


#####################################################################
# Step 3: Create tileset
#####################################################################

echo "==== Step 3: Creating tileset ${USERNAME}.${TILESET_ID} ===="

CREATE_RESPONSE=$(curl -s -X POST \
  "https://api.mapbox.com/tilesets/v1/${USERNAME}.${TILESET_ID}?access_token=${MAPBOX_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
        \"recipe\": $(cat recipe.json),
        \"name\": \"${TILESET_ID}\",
        \"description\": \"Created from GeoJSON with zoom extent 4 to 15\"
      }")

echo "Create tileset response:"
echo "$CREATE_RESPONSE"
echo "--------------------------------------------------------"
echo


#####################################################################
# Step 4: Publish tileset
#####################################################################

echo "==== Step 4: Publishing tileset (starting processing job) ===="

PUBLISH_RESPONSE=$(curl -s -X POST \
  "https://api.mapbox.com/tilesets/v1/${USERNAME}.${TILESET_ID}/publish?access_token=${MAPBOX_TOKEN}")

echo "Publish response:"
echo "$PUBLISH_RESPONSE"
echo "--------------------------------------------------------"

echo "Done! Your tileset is now processing on Mapbox."
echo "Tileset ID: ${USERNAME}.${TILESET_ID}"
```

## Bug
When Zoomed out, where zoom is <9 the smaller polygons disappear
<img width="1918" height="874" alt="image" src="https://github.com/user-attachments/assets/396b9420-c3b7-404b-9f82-8120cdebbb8d" />

When Zoomed in, where zoom is >9 the smaller polygons appear (when the fill disappears and village lines are only shown)
<img width="1918" height="888" alt="image" src="https://github.com/user-attachments/assets/f2355f07-ddd2-496e-9db3-fbb80d90e62d" />

