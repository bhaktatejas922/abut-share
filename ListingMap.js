import React from 'react';
import isEmpty from 'lodash/isEmpty';
import Map, { Layer, Source, useControl } from 'react-map-gl';

// import mapboxgl from 'mapbox-gl';
import Loader from 'components/Loader/Loader';
import { FixedMap } from './Listing.style';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useState, useCallback} from 'react';
import { gql, useQuery } from '@apollo/client';
import { AuthContext } from 'context/AuthProvider';

export let drawRef = null;

// const { loggedIn } = useContext(AuthContext);

export const GET_MAP_DATA = gql`
  query GetMapData {
    parcels_split(limit: 12) {
      backyard
    }
  }
`;
function Hello() { // WHY THIS NOT WORKING TODO
  const { loading, data } = useQuery(GET_MAP_DATA);
  if (loading) return <p>Loading ...</p>;
  console.log('data', data);
  return <h1>Hello {data}!</h1>;
}

// TODO This file is where all the map stuff is done
export const DrawControl = (props) => {
  drawRef = useControl(
    ({ map }) => {
      map.on('draw.create', props.onCreate);
      map.on('draw.update', props.onUpdate);

      // ...
      return new MapboxDraw(props);
    },
    ({ map }) => {
      map.off('draw.create', props.onCreate);
      // ...
    },
    {
      position: props.position,
    }
  );

  return null;
};
const ListingMap = (props) => {
  const { mapData, loading } = props;
  


  const MAPBOX_TOKEN =''; // Set your mapbox token here, deleted 

  const onUpdate = useCallback((e) => {
    // log the geometry of the polygon that was drawn on the map to the console
    console.log(JSON.stringify(e.features[0].geometry));
  }, []);
  // console.log("props", window.temp = props);
  Hello();
  return (
    // <FixedMap>`
    //     <Map location={mapData} />
    // </FixedMap>
    // read the Mapbox API access token from the .env file
    // make sure the css is using relative positioning to the cursor position
    // return a Map component from the react-map-gl 7.0 package that will also be used to draw a polygon on the map.
    // We will use mapbox-gl-draw to add fu``nctionality to draw a polygon on the map
    <FixedMap>
      <Map
        // {...rest}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        <DrawControl
          position="top-left"
          displayControlsDefault={false}
          defaultMode="draw_polygon"
          onCreate={onUpdate}
          onUpdate={onUpdate}
          // onDelete={onDelete}
          controls={{
            polygon: true,
            trash: true,
          }}
        />
        <Source
          id="parcels"
          type="vector"
          url={
            'https://tiles.regrid.com/api/v1/parcels?format=mvt&userToken=' // Set your regrid token here, deleted
          }
          minzoom={13}
          maxzoom={19}
        />
        <Layer
          id="parcels"
          type="line"
          source="parcels"
          source-layer="parcels"
          paint={{ 'line-color': '#649d8d', 'line-width': 1 }}
        />
        {/* // add a layer to the map that will display the regrid vector tiles that have parcel data
          // the source is a dynamically changing url that will be updated when the user moves the map */}
      </Map>
    </FixedMap> // I dont know why but map does not render without fixed map \__(^_^)__/
  );
};

export default ListingMap;
