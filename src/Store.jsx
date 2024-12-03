import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';
import { BrandsService, CategoriesService } from './Service';
import Product from './Product';
function Store(props) {
  //state
  let [brands, setBrands] = useState([]);
  let [categories, setCategories] = useState([]);
  let [products, setProducts] = useState([]);
  let [productsToShow, setProductsToShow] = useState([]);
  let [search, setSearch] = useState('');

  let userContext = useContext(UserContext);

  useEffect(() => {
    (async () => {
      //get brands from db
      let brandsResponse = await BrandsService.fetchBrands();

      let brandsResponseBody = await brandsResponse.json();
      brandsResponseBody.forEach((brand) => {
        brand.isChecked = true;
      });

      setBrands(brandsResponseBody);

      //get categories from db
      let categoriesResponse = await CategoriesService.fetchCategories();

      let categoriesResponseBody = await categoriesResponse.json();
      categoriesResponseBody.forEach((category) => {
        category.isChecked = true;
      });

      setCategories(categoriesResponseBody);

      // get products from db
      let productsResponse = await fetch(
        // `http://localhost:5000/products?productId_like=${search}`,
        `https://ecommerce-db-ghjy.onrender.com/products?productId_like=${search}`,
        { method: 'GET' }
      );

      let productsResponseBody = await productsResponse.json();
      if (productsResponse.ok) {
        productsResponseBody.forEach((product) => {
          //set brand
          product.brand = BrandsService.getBrandByBrandId(
            brandsResponseBody,
            product.brandId
          );

          //set category
          product.category = CategoriesService.getCategoryByCategoryId(
            categoriesResponseBody,
            product.categoryId
          );
          product.isOrdered = false;
        });

        setProducts(productsResponseBody);
        setProductsToShow(productsResponseBody);
        document.title = 'Store - eCommerce';
        console.log('search changed');
      }
    })();
  }, [search]);

  //updateBrandIsChecked
  let updateBrandIsChecked = (id) => {
    let brandsData = brands.map((brd) => {
      if (Number(brd.id) === Number(id)) brd.isChecked = !brd.isChecked;
      return brd;
    });

    setBrands(brandsData);
    updateProductsToShow();
  };

  //updateCategoryIsChecked
  let updateCategoryIsChecked = (id) => {
    let categoryData = categories.map((cat) => {
      if (Number(cat.id) === Number(id)) cat.isChecked = !cat.isChecked;
      return cat;
    });

    setCategories(categoryData);
    updateProductsToShow();
  };

  //updateProductsToShow
  let updateProductsToShow = () => {
    setProductsToShow(
      products
        .filter((prod) => {
          return (
            categories.filter(
              (category) =>
                Number(category.id) === Number(prod.categoryId) &&
                category.isChecked
            ).length > 0
          );
        })
        .filter((prod) => {
          return (
            brands.filter(
              (brand) =>
                Number(brand.id) === Number(prod.brandId) && brand.isChecked
            ).length > 0
          );
        })
    );
  };

  //When user clicks on Add to Cart function
  let onAddToCartClick = (prod) => {
    (async () => {
      let newOrder = {
        userId: userContext.user.currentUserId,
        productId: prod.id,
        quantity: 1,
        isPaymentCompleted: false,
      };

      // let orderResponse = await fetch(`http://localhost:5000/orders`, {
      let orderResponse = await fetch(
        `https://ecommerce-db-ghjy.onrender.com/orders`,
        {
          method: 'POST',
          body: JSON.stringify(newOrder),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (orderResponse.ok) {
        // let orderResponseBody = await orderResponse.json();

        //isOrderd = true
        let prods = products.map((p) => {
          if (Number(p.id) === Number(prod.id)) p.isOrdered = true;
          return p;
        });
        setProducts(prods);
        updateProductsToShow();

        // setProducts((prods) => {
        //   let currentProduct = prods.map((p) => {
        //     if (Number(p.id) === Number(prod.id)) p.isOrdered = true;
        //   });
        //   // currentProduct.isOrdered = true;
        //   return p;
        // });

        // setProducts(prods);
      } else {
        console.log(orderResponse);
      }
    })();
  };

  return (
    <div>
      <div className="row py-3 header">
        <div className="col-lg-3">
          <h4>
            <i className="fa fa-shopping-bag"></i>Store{' '}
            <span className="badge badge-secondary">
              {productsToShow.length}
            </span>
          </h4>
        </div>

        <div className="col-lg-9">
          <input
            type="search"
            value={search}
            placeholder="Search"
            className="form-control"
            autoFocus="autoFocus"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3 py-2">
          <div className="my-2">
            <h5>Brands</h5>
            <ul className="list-group list-group-flush">
              {brands.map((brand) => (
                <li className="list-group-item" key={brand.id}>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      classname="form-check-input"
                      value="true"
                      checked={brand.isChecked}
                      onChange={() => {
                        updateBrandIsChecked(brand.id);
                      }}
                      id={`brand${brand.id}`}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`brand${brand.id}`}
                    >
                      {brand.brandName}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="my-2">
            <h5>Categories</h5>
            <ul className="list-group list-group-flush">
              {categories.map((category) => (
                <li className="list-group-item" key={category.id}>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      classname="form-check-input"
                      value="true"
                      checked={category.isChecked}
                      onChange={() => {
                        updateCategoryIsChecked(category.id);
                      }}
                      id={`category${category.id}`}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`category${category.id}`}
                    >
                      {category.categoryName}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-9 py-2">
          <div className="row">
            {productsToShow.map((prod) => (
              <Product
                key={prod.id}
                product={prod}
                onAddToCartClick={onAddToCartClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Store;
