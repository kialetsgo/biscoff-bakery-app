const _ = require('lodash')
const ProductRatingModel = require('../models/product_ratings')
const ProductModel = require('../models/products')


const controllers = {
    newProductRatingForm: (req, res) => {
        let slug = req.params.slug
        ProductModel.findOne({
            slug: slug
        })
            .then(result => {
                if (!result) {
                    res.redirect('/products')
                    return
                }
                res.render('product_rating/new', {
                    pageTitle: "New Rating",
                    product: result
                })
            })
            .catch(err => {
                res.send(err)
                res.redirect('/products')
            })

    },
    createProductRating: (req, res) => {
        let slug = req.params.slug
        ProductModel.findOne(
            {
                slug: slug
            }
        )
            .then(result => {
                if (!result) {
                    res.redirect('/products/')
                    return
                }
                ProductRatingModel.create(
                    {
                        product_id: result._id.toString(),
                        product_slug: result.slug,
                        rating: req.body.rating,
                        comment: req.body.comment
                    }
                )
                    .then(prCreateResult => {
                        res.redirect('/products/' + slug)
                    })
                    .catch(err => {
                        console.log(err)

                    })

            })
            .catch(err => {
                console.log(err)
            })
    },
}

module.exports = controllers