import { gql, ApolloServer } from "apollo-server-micro";
import { PrismaClient } from "@prisma/client";
import Cors from "micro-cors";
const cors = Cors()
const prisma = new PrismaClient()

const typeDefs = gql`

  type Todo {
    id: String
    text: String
    isDone: Boolean
    createdAt: String
  }

  type Query {
    getTodo: [Todo]
  }

  type Mutation {
    addTodo(text: String, isDone: Boolean): Todo
    editTodo(id: String, text: String, isDone: Boolean): Todo
    deleteTodo(id: String): Todo
  }

`

const resolvers = {
  Query: {
    getTodo: (_parent, _args, _context) => {
      return prisma.todo.findMany()
    }
  },
  Mutation: {
    addTodo: (_parent, { text, isDone = false }, _context) => {
      return prisma.todo.create({ data: { text, isDone } })
    },
    editTodo: (_parent, {id, text, isDone = false }, _context) => {
      return prisma.todo.update({ where: { id }, data: { text, isDone } })
    },
    deleteTodo: (_parent, { id }, _context) => {
      return prisma.todo.delete({ where: { id } })
    }
  }
}

const apolloServer = new ApolloServer({ typeDefs, resolvers })
const startServer = apolloServer.start()
// const handler = apolloServer.createHandler({ path: '/api/graphql'})

export const config = { api: { bodyParser: false } }

export default cors(async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.end()
    return false
  }

  await startServer
  await apolloServer.createHandler({ path: '/api/graphql'})(req, res)
})