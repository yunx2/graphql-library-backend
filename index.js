const { ApolloServer, gql } = require('apollo-server');
const { v1: uuid } = require('uuid')
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
    allBooks(author: String, genre: String): [Book!]!,
    allAuthors: [Author!]!
  }
  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String
      genres: [String!]!
    ): Book
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      const authorFilter = book => book.author === args.author
      const genreFilter = book => book.genres.includes(args.genre)
      if (args.author && args.genre) {
        const byAuthor = books.filter(authorFilter)
        return byAuthor.filter(genreFilter)
      }
      if (args.author) {
        return books.filter(authorFilter)
      }
      if (args.genre) {
        return books.filter(genreFilter)
      } else {
        return books
      }
    },
    allAuthors: () => authors
  },
  Author: {
    bookCount: (root, args) => {
      const booksWritten = books.filter(book => book.author === root.name)
      return booksWritten.length
    }
  },
  Mutation: {
    addBook: (root, args) => { 
      const book = { ...args, id: uuid() } // create book object from passed in parameters and give id
      if (!books.some(book => book.author === args.author)) { // check if author already in data
        const author = { name: args.author, id: uuid() } // creat author object and give id
        authors = authors.concat(author) // add new author to authors
      }
      books = books.concat(book) // add new book to data
      return book 
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