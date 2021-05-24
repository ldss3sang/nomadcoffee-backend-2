import { gql } from 'apollo-server';

// The GraphQL schema
export default gql`
  type Query {
    "A simple type for getting started!"
    hello: String
  }
`;
