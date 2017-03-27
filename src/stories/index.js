import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import '../style/semantic/semantic.min.css'
import ArtCard from '../components/playground/art/ArtCard'
import Art from '../components/playground/art/Art'

const art = {
  image: 'http://images.metmuseum.org/CRDImages/ad/web-large/126417.jpg',
  title: 'Some Thing',
  department: 'Testing Department',
  artist: 'Matthew Ailes',
  artist_bio: 'A man living in Richmond, VA',
  date: 'September 25, 2017',
  medium: 'Bronze'
}

storiesOf('Met Museum Art', module)
  .add('Art card', () => (
    <ArtCard art={art} />
  ))
  .add('Art page', () => (
    <Art />
  ))