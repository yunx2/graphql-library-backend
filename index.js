const { ApolloServer, UserInputError, gql } = require('apollo-server');
const mongoose = require('mongoose');

const Book = require('./models/Book');
const Author = require('./models/Author');
const connectionString = require('./constants')

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

mongoose.set('useFindAndModify', false);

console.log('connecting to', connectionString);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect(connectionString, options)
  .then(() => console.log('connected to mongodb'))
  .catch(err => console.log('error connecting to mongodb:', err.message));

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
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
    editAuthor(
      name: String!
      born: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () =>Author.collection.countDocuments(),
    allBooks: (root, args) => {
      return Book.find({}); 
    },
      // const authorFilter = book => book.author === args.author
      // const genreFilter = book => book.genres.includes(args.genre)
      // if (args.author && args.genre) {
      //   const byAuthor = books.filter(authorFilter)
      //   return byAuthor.filter(genreFilter)
      // }
      // if (args.author) {
      //   return books.filter(authorFilter)
      // }
      // if (args.genre) {
      //   return books.filter(genreFilter)
      // } else {
      //   return books
      // }
    
    allAuthors: () => Author.find({}) // return value is a promise
  },
  // Author: {
  //   bookCount: (root, args) => {
  //     const booksWritten = books.filter(book => book.author === root.name)
  //     return booksWritten.length
  //   }
  // },
  Mutation: {
    addBook: (root, args) => { 
      const book = new Book({ ...args });
      return book.save();
    }, 
    //   if (!books.some(book => book.author === args.author)) { // check if author already in data
    //     const author = { name: args.author, id: uuid() } // creat author object and give id
    //     authors = authors.concat(author) // add new author to authors
    //   }
    //   books = books.concat(book) // add new book to data
    //   return book 
    // },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      author.born = args.born;
      return author.save();
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})