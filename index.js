const { ApolloServer, gql } = require('apollo-server');
let books = require('./data/booksData')
let authors = require('./data/authorsData')

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: String!
    id: String!
    genres: [String!]!
  }
  type Author {
    name: String!
    id: String!
    bookCount: Int
    born: Int
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String): [Book!]!,
    allAuthors: [Author!]!
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      if (args.author) {
        return books.filter(book => book.author === args.author)
      } 
      return books
    },
    allAuthors: () => authors
  },
  Author: {
    bookCount: (root) => {
      const booksWritten = books.filter(book => book.author === root.name)
      return booksWritten.length
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})