const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');

const Category = require('./models/category');
const User = require('./models/user');
const Idea = require('./models/ideas');
// const largeData = require('./models/largeData.json');
//  const Users = require('./models/usersList.json');
//  const Ideas = require('./models/ideas.json');
// const UsersFull = require('./models/usersFull.json');

const app = express();

// UsersFull.map(user => {
//    const newUser = new User (user);

//     newUser.save();
// });


/** Add published ideas in users */
// const rs = User.find().exec(function (err, users) {
//     users.map(user => {
//         Idea.find({user_id: user.id}).select('id license_type category -_id').exec(function(err, ideas) {
//             const userLicenseTypes = [];
//             const userPublishedIdeas = [];
//             const userCategory = [];
        
//             ideas.map(idea => {
//                 userLicenseTypes.push(idea.license_type);
//                 userPublishedIdeas.push(idea.id);
//                 userCategory.push(idea.category);
//             });


//             user.published_ideas = userPublishedIdeas;
//             user.license_types = [...new Set(userLicenseTypes)];
//             user.categories = [...new Set(userCategory)];
//             user.save();
//         });  
//     })
// });


// Users.map(user => {
//    const newUser = new User ({
//         id: user.id,
//         first_name: user.first_name,
//         last_name: user.last_name
//     });

//     newUser.save();
// });

// Ideas.map(idea => {
//    const newIdea = new Idea ({
//     "id": idea.id,
//     "user_id": idea.user_id,
//     "name": idea.name,
//     "category": idea.category,
//     "teaser_text": idea.teaser_text,
//     "full_disclosure_text": idea.full_disclosure_text,
//     "keywords": idea.keywords,
//     "license_type": idea.license_type,
//     "stage_dev": idea.stage_dev
//     });

//     newIdea.save();
// });


app.use('/graphql', graphQlHttp({
    schema: buildSchema(`
       type Category {
           _id: ID!
           id: Int!
           name: String!
       } 

       input CategoryInput {
           id: Int!
           name: String!
       }

       type RootQuery {
          categories: [Category!]!  
       }

       type RootMutation {
           createCategory(eventInput: CategoryInput): Category 
       }
       schema {
           query: RootQuery
           mutation: RootMutation
       } 
    `),
    rootValue: {
        categories: () => {
            return Category.find()
            .then(results => {
                return results.map(event => {
                    console.log(event._doc.props);
                    return {...event._doc, _id: event._doc._id.toString(), props: event._doc.props}
                });
            })
            .catch(err => {
                throw err;
            });
        },
        createCategory: (args) => {
        
            const event = new Category ({
                id: args.eventInput.id,
                name: args.eventInput.name,
            });

           return event.save().then(result => {
               return {...result._doc}
            }).catch(err => {
                console.log(err);
            });
        }
    },
    graphiql: true
}));

app.use(bodyParser.json());
var url = "";

mongoose.connect(url)
        .then( () => {
            app.listen(3001);
        }
        ).catch(err => {
            console.log(err);
        }
);
