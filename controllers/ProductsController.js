const _ = require('lodash')
const ProductModel = require('../models/products')
const ProductRatingModel = require('../models/product_ratings')

const controllers = {
    listProducts: (req, res) => {
        ProductModel.find()
            .then(results => {
                res.render('products/index', {
                    pageTitle: "List of Baked Goods",
                    bakedGoods: results
                })
            })
    },
    showProduct: (req, res) => {
        let slug = req.params.slug

        ProductModel.findOne({
            slug: slug
        })
            .then(result => {
                if (!result) {
                    res.redirect('/products')
                    return
                }

                // find associated ratings here
                ProductRatingModel.find(
                    {
                        product_slug: result.slug
                    }
                )
                    .then(ratingResults => {
                        res.render('products/show', {
                            pageTitle: "Show Baked Good",
                            item: result,
                            ratings: ratingResults
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        res.redirect('/products')
                    })
            })
            .catch(err => {
                res.send(err)
            })
    },

    newProduct: (req, res) => {
        res.render('products/new', {
            pageTitle: "Create New Baked Good",
        })
    },
    createProduct: (req, res) => {
        const slug = _.kebabCase(req.body.product_name)
        ProductModel.create({
            name: req.body.product_name,
            slug: slug,
            price: req.body.price,
            image: req.body.img_url
        })
            .then(result => {
                res.redirect('/products/' + slug)
            })
            .catch(err => {
                res.redirect('products/new')
            })
    },
    showEditForm: (req, res) => {
        let slug = req.params.slug
        ProductModel.findOne({
            slug: slug,
        })
            .then(result => {
                if (!result) {
                    res.redirect('/products')
                    return
                }
                res.render('products/edit', {
                    pageTitle: "Edit form for " + result.name,
                    item: result,
                    itemID: result.slug
                })
            })
            .catch(err => {
                res.send(err)
            })

    },
    updateProduct: (req, res) => {
        let slug = req.params.slug
        let newSlug = _.kebabCase(req.body.product_name)
        // findOneAndUpdate will always run regardless of results in then
        ProductModel.findOne(
            {
                slug: slug
            },
        )
            .then(result => {
                if (!result) {
                    res.redirect('/products')
                    return
                }
                ProductModel.updateOne(
                    {
                        slug: slug
                    },
                    {
                        name: req.body.product_name,
                        slug: newSlug,
                        price: req.body.price,
                        image: req.body.img_url
                    }
                )
                    .then(result => {
                        if (!result || req.body.product_name == "") {
                            res.redirect('/products')
                            return
                        }
                        res.redirect('/products/' + newSlug)
                    })
                    .catch(err => {
                        res.send(err)
                    })

            })
            .catch(err => {
                res.send(err)
            })
        // let itemArrIndex = req.params.id
        // if (!checkParamId(itemArrIndex, bakedGoods)) {
        //     res.redirect('/products')
        // }
        // bakedGoods[itemArrIndex].name = req.body.product_name
        // bakedGoods[itemArrIndex].price = req.body.price
        // bakedGoods[itemArrIndex].image = req.body.img_url

        // res.redirect('/products/' + itemArrIndex)
    },
    deleteProduct: (req, res) => {
        let slug = req.params.slug
        ProductModel.findOne(
            {
                slug: slug
            },
        )
            .then(result => {
                if (!result) {
                    res.redirect('/products')
                    return
                }
                ProductModel.deleteOne(
                    {
                        slug: slug
                    })
                    .then(deleteResult => {
                        res.redirect('/products')
                    })
                    .catch(err => {
                        res.send(err)
                        res.redirect('/products')
                    })
            })
            .catch(err => {
                res.send(err)
                res.redirect('/products')
            })
        // let itemArrIndex = req.params.id
        // if (!checkParamId(itemArrIndex, bakedGoods)) {
        //     res.redirect('/products')
        //     // if there's no return, this function will attempt to send 2 response - error.
        //     return
        // }
        // bakedGoods.splice(itemArrIndex, 1)
        // res.redirect('/products')
    }
}

function checkParamId(givenID, collection) {
    if (givenID < 0 || givenID > collection.length - 1) {
        return false
    }
    return true
}
module.exports = controllers