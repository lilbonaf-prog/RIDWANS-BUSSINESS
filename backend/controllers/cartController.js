import userModel from "../models/userModel.js";

// ==========================================
// RIDWAN BUSINESS
// SHOPPING CART CONTROLLER
// ==========================================

// Validate MongoDB product IDs
const isValidProductId = (itemId) => {
  return (
    typeof itemId === "string" &&
    /^[a-fA-F0-9]{24}$/.test(itemId)
  );
};

// ==========================================
// 1. ADD PRODUCT TO CART
// ==========================================

const addToCart = async (req, res) => {
  try {
    // Get user ID from verified JWT
    const userId = req.user.id;

    const { itemId } = req.body;

    // Validate product ID
    if (!isValidProductId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const cartField = `cartData.${itemId}`;

    // Atomically increase product quantity
    const user = await userModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          [cartField]: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully.",
      cartData: user.cartData || {},
    });

  } catch (error) {
    console.error("Add to cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add product to cart.",
    });
  }
};

// ==========================================
// 2. REMOVE PRODUCT FROM CART
// ==========================================

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { itemId } = req.body;

    if (!isValidProductId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const cartField = `cartData.${itemId}`;

    // If quantity is exactly 1,
    // remove the product completely.
    const removedUser = await userModel.findOneAndUpdate(
      {
        _id: userId,
        [cartField]: 1,
      },
      {
        $unset: {
          [cartField]: "",
        },
      },
      {
        new: true,
      }
    );

    if (removedUser) {
      return res.status(200).json({
        success: true,
        message: "Product removed from cart.",
        cartData: removedUser.cartData || {},
      });
    }

    // If quantity is greater than 1,
    // decrease it by one.
    const updatedUser = await userModel.findOneAndUpdate(
      {
        _id: userId,
        [cartField]: { $gt: 1 },
      },
      {
        $inc: {
          [cartField]: -1,
        },
      },
      {
        new: true,
      }
    );

    if (updatedUser) {
      return res.status(200).json({
        success: true,
        message: "Cart quantity updated.",
        cartData: updatedUser.cartData || {},
      });
    }

    // Check whether customer account exists
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product is not in the cart.",
      cartData: user.cartData || {},
    });

  } catch (error) {
    console.error("Remove from cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to remove product from cart.",
    });
  }
};

// ==========================================
// 3. GET CUSTOMER CART
// ==========================================

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel
      .findById(userId)
      .select("cartData");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Exclude any old entries with
    // quantities of zero or less.
    const cartData = Object.fromEntries(
      Object.entries(user.cartData || {}).filter(
        ([, quantity]) => Number(quantity) > 0
      )
    );

    return res.status(200).json({
      success: true,
      cartData,
    });

  } catch (error) {
    console.error("Get cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve shopping cart.",
    });
  }
};

// ==========================================
// 4. CLEAR CUSTOMER CART
// ==========================================

// IMPORTANT:
// Do not connect this function to the
// /api/cart/clear route yet.
//
// We must first correct the Paystack checkout
// flow so carts aren't cleared before payment.

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          cartData: {},
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shopping cart cleared successfully.",
      cartData: {},
    });

  } catch (error) {
    console.error("Clear cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to clear shopping cart.",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

export {
  addToCart,
  removeFromCart,
  getCart,
  clearCart,
};