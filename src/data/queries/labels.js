import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import fetch from 'isomorphic-fetch';
import LabelType from '../types/LabelType';

const label = {
  type: LabelType,
  resolve(root) {
    return {
      id: '123',
      name: 'labelname',
      messagesTotal: 12,
    }
  }
}

export default label;
