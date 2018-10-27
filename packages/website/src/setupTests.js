// @flow

import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import 'jest-enzyme'

jest.mock('shortid', () => ({
  generate: () => 'shortid',
}))

configure({ adapter: new Adapter() })
