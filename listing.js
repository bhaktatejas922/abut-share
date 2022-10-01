import { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Sticky from 'react-stickynode';
import Toolbar from 'components/UI/Toolbar/Toolbar';
import CategorySearch from 'containers/Listing/Search/CategorySearch/CategorySearch';
import { Checkbox } from 'antd';
import SectionGrid from 'components/SectionGrid/SectionGrid';
import { PostPlaceholder } from 'components/UI/ContentLoader/ContentLoader';
import ListingMap from 'containers/Listing/ListingMap';
import { SearchContext } from 'context/SearchProvider';
import {
  getAPIData,
  paginator,
  searchedData,
  searchStateKeyCheck,
  processAPIData,
} from 'library/helpers/get-api-data';
import { getDeviceType } from 'library/helpers/get-device-type';
import { SINGLE_POST_PAGE } from 'settings/constant';
import {
  LISTING_PAGE_POST_LIMIT,
  LISTING_PAGE_COLUMN_WIDTH_WITHOUT_MAP,
  LISTING_PAGE_COLUMN_WIDTH_WITH_MAP,
} from 'settings/config';
import ListingWrapper, {
  PostsWrapper,
  ShowMapCheckbox,
} from 'containers/Listing/Listing.style';

// TODO finish this auth stuff
import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider } from '@apollo/client';
import firebase from 'firebase/app'
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
} from 'firebase/auth';
import 'firebase/app'
import { setContext } from '@apollo/client/link/context';
import { useQuery, gql } from '@apollo/client';
import { Button } from 'antd';



const firebaseConfig = {
  apiKey: 'AIzaSyCQ_ft0GC7pBfCwJxElzXjJl8knuLKNo8Q',
  authDomain: 'abut-deb35.firebaseapp.com',
  databaseURL: 'https://abut-deb35-default-rtdb.firebaseio.com',
  projectId: 'abut-deb35',
  storageBucket: 'abut-deb35.appspot.com',
  messagingSenderId: '372589891875',
  appId: '1:372589891875:web:265ae5e6fffea102467c96',
  measurementId: 'G-BBZYX3H6XC',
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    console.log('user is signed in', uid);
    user.getIdToken()
    // store the token in local storage
    localStorage.setItem('token', user.accessToken);
    // ...
  }
});

const authLink = setContext((_, { headers }) => {
  //it will get the token from localstorage
  const idToken = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: idToken ? `Bearer ${idToken}` : '',
    },
  };
});


const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL,
});
const client = new ApolloClient({
  ssrMode: typeof window !== 'undefined',
  cache: new InMemoryCache().restore({}),
  link: authLink.concat(httpLink),
})


const FilterDrawer = dynamic(() =>
  import('containers/Listing/Search/MobileSearchView')
);

export default function ListingPage({ processedData, deviceType }) {
  const { state, dispatch } = useContext(SearchContext);
  const statekey = searchStateKeyCheck(state);
  const [posts, setPosts] = useState(
    processedData.slice(0, LISTING_PAGE_POST_LIMIT) || []
  );
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [saverun, setSaverun] = useState(false);

  useEffect(() => {
    if (statekey === true) {
      const newData = searchedData(processedData);
      setPosts(newData);
    } else {
      setPosts(processedData.slice(0, LISTING_PAGE_POST_LIMIT) || []);
    }
  }, [statekey]);

  // setShowMap((showMap) => !showMap);
  const handleMapToggle = () => {
    setShowMap((showMap) => !showMap);
    // query a sample and log it to the console
  };

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      const data = paginator(posts, processedData, LISTING_PAGE_POST_LIMIT);
      setPosts(data);
      setLoading(false);
    }, 1000);
  };

  let columnWidth = LISTING_PAGE_COLUMN_WIDTH_WITHOUT_MAP;
  if (showMap) {
    columnWidth = LISTING_PAGE_COLUMN_WIDTH_WITH_MAP;
  }

  let columnCount = 'col-24';
  if (deviceType === 'desktop' && showMap === true) {
    columnCount = 'col-12';
  }

  const saveandrun = () => {
    // insert geojson via mutation, asign to user_id and save with random polygon_id
    // BUT HOW DO I GET THE POLYGON FROM THE listingMap.js component?
    // I need to get the polygon from the listingMap.js component

    setSaverun(true);
    console.log('save and run');
  };

  return (
    <ApolloProvider client={client}>
      <ListingWrapper>
        <Head>
          <title>Listing | A react next listing template</title>
        </Head>

        <Sticky top={82} innerZ={999} activeClass="isHeaderSticky">
          <Toolbar
            left={
              deviceType === 'desktop' ? <CategorySearch /> : <FilterDrawer />
            }
            right={
              <ShowMapCheckbox>
                {/* <Button onClick={() => saveandrun()} type="default">Save & Run</Button> TODO*/} 
                <Checkbox defaultChecked={true} onChange={handleMapToggle}>
                  Show map
                </Checkbox>
              </ShowMapCheckbox>
            }
            
          />
        </Sticky>

        <PostsWrapper className={columnCount}>
          <SectionGrid
            link={SINGLE_POST_PAGE}
            columnWidth={columnWidth}
            deviceType={deviceType}
            data={posts}
            totalItem={processedData.length}
            limit={LISTING_PAGE_POST_LIMIT}
            loading={loading}
            handleLoadMore={handleLoadMore}
            placeholder={<PostPlaceholder />}
          />
        </PostsWrapper>
        {/* need to pass in more things as props to the map, specifically the saveand run queried data */}
        {showMap && <ListingMap loading={loading} mapData={posts} />} 
      </ListingWrapper>
    </ApolloProvider>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const apiUrl = [
    {
      endpoint: 'hotel',
      name: 'listingHotel',
    },
  ];
  const pageData = await getAPIData(apiUrl);
  const processedData = processAPIData(pageData);
  const deviceType = getDeviceType(req);
  return {
    props: { processedData, deviceType },
  };
}
