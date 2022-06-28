var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay({
    element: container,
    autoPan: {
        animation: {
            duration: 250,
        },
    },
});

closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};
var wmsSource = new ol.source.TileWMS({
    url: 'http://localhost:8080/geoserver/west_bengal_covid/wms',
    params: { 'LAYERS': 'west_bengal_covid:west_bengal', 'TILED': true },
    serverType: 'geoserver',
    // Countries have transparency, so do not fade tiles:
    transition: 0
})
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        new ol.layer.Tile({
            source: wmsSource
        })
    ],
    overlays: [overlay],
    view: new ol.View({
        center: ol.proj.fromLonLat([88.12505730330503, 24.275019818540272]),
        zoom: 7
    })
});
map.on('singleclick', function (evt) {
    var coordinate = evt.coordinate;
    var view = map.getView();
    var viewResolution = view.getResolution();
    var url = wmsSource.getFeatureInfoUrl(
        evt.coordinate, viewResolution, view.getProjection(),
        { 'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 1 });
    console.log(url)

    fetch(url)
        .then(response => response.json())
        .then(data => {
            var value = data.features[0].properties
            var keys = Object.keys(value)
            var str = keys.map(A => {
                return (A + ' = ' + value[A])
            }).join('<br><br>')
            console.log(str)
            content.innerHTML = '<p>' + str + '</p>';
        })
    overlay.setPosition(coordinate);
});