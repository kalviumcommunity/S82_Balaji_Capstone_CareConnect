const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Doctor {
    id: ID!
    fullName: String!
    email: String!
    specialization: String!
    experience: Int!
    location: String!
    certificateUrl: String!
    isVerified: Boolean!
    addresses: [Address]
    createdAt: String
    updatedAt: String
  }

  type Address {
    id: ID!
    street: String!
    city: String!
    state: String!
    pincode: String!
  }

  input DoctorInput {
    fullName: String!
    email: String!
    password: String!
    specialization: String!
    experience: Int!
    location: String!
    certificateUrl: String!
  }

  input UpdateDoctorInput {
    fullName: String
    specialization: String
    experience: Int
    location: String
    certificateUrl: String
    isVerified: Boolean
  }

  type Query {
    getAllDoctors: [Doctor]
    getDoctorById(id: ID!): Doctor
  }

  type Mutation {
    createDoctor(input: DoctorInput!): Doctor
    updateDoctor(id: ID!, input: UpdateDoctorInput!): Doctor
    deleteDoctor(id: ID!): String
  }
`;

module.exports = typeDefs;
