import { supabase } from "./supabaseClient";

// ✅ Register User in Supabase
export const registerUser = async (userData) => {
  const { name, email, password, phone } = userData;

  try {
    // ✅ Hash password before storing (do this in backend)
    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password, phone }]);
    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error registering user:", error.message);
    return null;
  }
};

// ✅ Login User (Fetch user from Supabase)
export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  try {
    // ✅ Fetch user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();  // ✅ Won't throw error if no user is found

    if (error || !user) {
      console.error("Login failed: User not found");
      return null;
    }

    // ✅ Verify password (you should hash passwords in backend)
    if (password !== user.password) {
      console.error("Login failed: Incorrect password");
      return null;
    }

    return user; // ✅ Return user data
  } catch (error) {
    console.error("Error logging in:", error.message);
    return null;
  }
};

// ✅ Fetch All Books from Supabase
export const fetchBooks = async () => {
  try {
    const { data, error } = await supabase.from("books").select("*");

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching books:", error.message);
    return [];
  }
};

// ✅ Add a New Book to Supabase
export const addBook = async (isbn, copies = 1) => {
  try {
    // 🔍 Check if book already exists
    const { data: existingBook, error: fetchError } = await supabase
      .from("books")
      .select("*")
      .eq("isbn", isbn)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existingBook) {
      // ✅ Book exists — increment the copies
      const updatedCopies = existingBook.copies + copies;
      const { error: updateError } = await supabase
        .from("books")
        .update({ copies: updatedCopies })
        .eq("isbn", isbn);

      if (updateError) throw updateError;

      return {
        success: true,
        message: `Existing book found. Updated copies to ${updatedCopies}.`,
        data: { ...existingBook, copies: updatedCopies },
      };
    }

    // ✅ Book doesn't exist — fetch from Google Books API
    const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const googleData = await googleResponse.json();

    if (!googleData.items || googleData.items.length === 0) {
      throw new Error("Book not found in Google Books API");
    }

    const bookInfo = googleData.items[0].volumeInfo;
    if (!bookInfo) {
      throw new Error("Book information not available");
    }

    const book = {
      title: bookInfo.title || "Unknown",
      author: bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown",
      isbn,
      category: bookInfo.categories ? bookInfo.categories.join(", ") : "Unknown",
      publisher: bookInfo.publisher || "Unknown",
      published_year: bookInfo.publishedDate?.split("-")[0] || "Unknown",
      genre: bookInfo.categories?.[0] || "Unknown",
      language: bookInfo.language || "Unknown",
      edition: bookInfo.publishedDate || "Unknown",
      cover_url: bookInfo.imageLinks?.thumbnail || "",
      copies,
    };

    // ✅ Insert new book
    const { data, error } = await supabase.from("books").insert([book]).select("*");
    if (error) throw error;

    return {
      success: true,
      message: "New book added successfully!",
      data,
    };
  } catch (error) {
    console.error("❌ Error adding book:", error.message);
    return {
      success: false,
      message: error.message || "An error occurred.",
    };
  }
};

