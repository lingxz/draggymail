import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import LabelType from './LabelType';

const EmailType = new ObjectType({
  name: 'Email',
  fields: {
    id: { type: new NonNull(StringType) },
    subject: { type: StringType },
    from: { type: new NonNull(StringType) },
    to: { type: StringType },
    content: { type: StringType },
    threadId: { type: StringType },
    labelIds: { type: new List(LabelType) }
  },
});

export default EmailType;
