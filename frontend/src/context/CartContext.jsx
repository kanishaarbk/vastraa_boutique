import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

const CartContext = createContext(null);

/*
 * Cart settings
 */
const CART_STORAGE_KEY = 'vastraa_boutique_cart_v1';

const FREE_DELIVERY_THRESHOLD = 500;
const FLAT_DELIVERY_FEE = 50;

/*
 * Cart Provider
 */
export function CartProvider({ children }) {
  /*
   * Load cart from localStorage
   */
  const [items, setItems] = useState(() => {
    try {
      const storedCart =
        localStorage.getItem(
          CART_STORAGE_KEY
        );

      if (!storedCart) {
        return [];
      }

      const parsedCart =
        JSON.parse(storedCart);

      return Array.isArray(parsedCart)
        ? parsedCart
        : [];
    } catch (error) {
      console.error(
        'Unable to load shopping bag:',
        error
      );

      return [];
    }
  });

  /*
   * Save cart whenever items change
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        'Unable to save shopping bag:',
        error
      );
    }
  }, [items]);

  /*
   * Add product to shopping bag
   */
  const addToCart = (
    product,
    quantity = 1
  ) => {
    if (!product) {
      return {
        success: false,
        addedQty: 0,
        message:
          'Product information is unavailable.',
      };
    }

    const stock =
      Number(product.stock) || 0;

    if (stock <= 0) {
      return {
        success: false,
        addedQty: 0,
        message:
          'This style is currently sold out.',
      };
    }

    const requestedQuantity =
      Math.max(
        1,
        Number(quantity) || 1
      );

    let addedQty = 0;
    let reachedLimit = false;

    setItems((previousItems) => {
      const existingIndex =
        previousItems.findIndex(
          (item) =>
            item.product.id === product.id
        );

      /*
       * Product already exists
       */
      if (existingIndex !== -1) {
        const existingItem =
          previousItems[
            existingIndex
          ];

        const currentQuantity =
          existingItem.quantity;

        const newQuantity =
          Math.min(
            currentQuantity +
              requestedQuantity,
            stock
          );

        addedQty =
          newQuantity -
          currentQuantity;

        if (
          newQuantity === stock &&
          currentQuantity +
            requestedQuantity >
            stock
        ) {
          reachedLimit = true;
        }

        const updatedItems = [
          ...previousItems,
        ];

        updatedItems[
          existingIndex
        ] = {
          ...existingItem,
          product,
          quantity: newQuantity,
        };

        return updatedItems;
      }

      /*
       * New product
       */
      const initialQuantity =
        Math.min(
          requestedQuantity,
          stock
        );

      addedQty =
        initialQuantity;

      if (
        requestedQuantity >
        stock
      ) {
        reachedLimit = true;
      }

      return [
        ...previousItems,
        {
          product,
          quantity: initialQuantity,
        },
      ];
    });

    return {
      success: addedQty > 0,
      addedQty,
      reachedLimit,
      message:
        reachedLimit
          ? `Only ${stock} available for this style.`
          : 'Style added to your shopping bag.',
    };
  };

  /*
   * Update product quantity
   */
  const updateQuantity = (
    productId,
    newQuantity
  ) => {
    const quantity =
      Number(newQuantity);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      removeFromCart(productId);
      return;
    }

    setItems(
      (previousItems) =>
        previousItems
          .map((item) => {
            if (
              item.product.id !==
              productId
            ) {
              return item;
            }

            const stock =
              Number(
                item.product.stock
              ) || 0;

            /*
             * Never allow cart quantity
             * to exceed available stock.
             */
            const boundedQuantity =
              Math.min(
                Math.floor(quantity),
                stock
              );

            return {
              ...item,
              quantity:
                boundedQuantity,
            };
          })
          .filter(
            (item) =>
              item.quantity > 0
          )
    );
  };

  /*
   * Remove product from shopping bag
   */
  const removeFromCart = (
    productId
  ) => {
    setItems(
      (previousItems) =>
        previousItems.filter(
          (item) =>
            item.product.id !==
            productId
        )
    );
  };

  /*
   * Empty entire shopping bag
   */
  const clearCart = () => {
    setItems([]);
  };

  /*
   * Calculate subtotal
   */
  const subtotal =
    items.reduce(
      (total, item) => {
        const price =
          parseFloat(
            item.product.price
          ) || 0;

        const quantity =
          Number(
            item.quantity
          ) || 0;

        return (
          total +
          price * quantity
        );
      },
      0
    );

  /*
   * Total number of products
   */
  const totalItemsCount =
    items.reduce(
      (total, item) =>
        total +
        (Number(
          item.quantity
        ) || 0),
      0
    );

  /*
   * Delivery calculation
   *
   * ₹500 and above → FREE
   * Below ₹500 → ₹50
   */
  const deliveryCharge =
    items.length === 0
      ? 0
      : subtotal >=
        FREE_DELIVERY_THRESHOLD
      ? 0
      : FLAT_DELIVERY_FEE;

  /*
   * Final payable amount
   */
  const totalAmount =
    subtotal +
    deliveryCharge;

  /*
   * Amount needed for free delivery
   */
  const amountUntilFreeDelivery =
    Math.max(
      0,
      FREE_DELIVERY_THRESHOLD -
        subtotal
    );

  return (
    <CartContext.Provider
      value={{
        items,

        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,

        subtotal,
        totalItemsCount,

        deliveryCharge,
        totalAmount,

        freeDeliveryThreshold:
          FREE_DELIVERY_THRESHOLD,

        amountUntilFreeDelivery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/*
 * Custom hook
 */
export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider.'
    );
  }

  return context;
}