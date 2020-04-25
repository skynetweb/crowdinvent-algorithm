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

const coefCateg = 0.15;
const coefFollowee = 0.25;
const coefInteracted = 0.30;
const coefLicense = 0.05;
const coefRandom = 0.05;
const coefKeywords = 0.15;
const coefDate = 0.05;
const treshold = 0.9;
const millisec = 1000 * 60 * 60 * 24;

/** Add published ideas in users */
const rs = User.find({id: 2}).exec(function (err, users) {
    users.map(user => {
        let userIdeasCategories = user.categories;
        let userIdeasFollowees = user.followees;
        let userInteractedIdeas = user.interacted_ideas.map(interIdea => {
            return interIdea.id;
        });
        
        let userLicenseTypes = user.license_types;
        let userKeywords = user.keywords;
    
        Idea.aggregate(
        [
            {
                "$lookup":
                {
                    from: "user",
                    localField: "user_id",
                    foreignField: "id",
                    as: "docs"
                }
            },
        {
        "$addFields": {
            isInCategories: {
              $cond : {
                  if: { 
                      $in : ["$category", userIdeasCategories]
                  }, 
                  then: 1, 
                  else: 0
              }
            },
            isInFollowees: {
                $cond : {
                    if: { 
                        $in : ["$user_id", userIdeasFollowees]
                    }, 
                    then: 1, 
                    else: 0
                }
            },
            isInInteracted: {
                $cond : {
                    if: { 
                        $in : ["$id", userInteractedIdeas]
                    }, 
                    then: 1, 
                    else: 0
                }
            },
            isInLicenseTypes: {
                $cond : {
                    if: { 
                        $in : ["$license_type", userLicenseTypes]
                    }, 
                    then: 1, 
                    else: 0
                }
            },
            commonKeywords: {
                $setIntersection: [
                  "$keywords", userKeywords
                ]
            },
            dayssince: {
                $abs: {
                    $trunc: {
                        $divide: [{ $subtract: [new Date(), '$created'] }, millisec]
                    }
                }
            }
          }
        }
        ]
    ).exec(function(err, ideas) {
            ideas.map(idea => {
                console.log(idea.dayssince, idea.created);
                let userRandom = Math.random() * coefRandom;
                let score = 0;
                score += idea.isInCategories * coefCateg;
                score += idea.isInFollowees * coefFollowee;
                score += idea.isInInteracted * coefInteracted;
                score += (idea.keywords.length > 0) ? (idea.commonKeywords.length / idea.keywords.length) * coefKeywords : 0;
                score += idea.isInLicenseTypes * coefLicense;

                if (idea.dayssince > 0) {
                    if (idea.dayssince > 30) {
                        score += (1 / (idea.dayssince / 30)) * coefDate
                    } else {
                        score += ((0.2 / (idea.dayssince)) + 0.8) * coefDate;
                    }
                } else {
                    score += coefDate;
                }

                score += userRandom;
                 
                // if (score > 0.3) {
                //      console.log({"score": score, "ideaId": idea.id, "followees": idea.isInFollowees, "interacted": idea.isInInteracted });
                // } 
            });
        });  
    })
});


app.use('/', graphQlHttp({
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
 var url = "mongodb+srv://crowdInvent:evr0UVSqZX9PeX8M@cluster0-kneou.mongodb.net/crowdInvent?retryWrites=true&w=majority";

mongoose.connect(url)
        .then( () => {
            app.listen(3001);
        }
        ).catch(err => {
            console.log(err);
        }
);
