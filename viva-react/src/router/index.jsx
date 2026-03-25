import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const News = lazy(() => import('../pages/News'));
const Gallery = lazy(() => import('../pages/Gallery'));
const JoinUs = lazy(() => import('../pages/JoinUs'));
const Leadership = lazy(() => import('../pages/Leadership'));
const Activities = lazy(() => import('../pages/Activities'));
const Contact = lazy(() => import('../pages/Contact'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'news', element: <News /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'join', element: <JoinUs /> },
      { path: 'leadership', element: <Leadership /> },
      { path: 'activities', element: <Activities /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
]);
