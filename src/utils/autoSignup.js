// src/utils/autoSignup.js
import { supabase } from "./supabaseClient";

// Add this new function to generate secure passwords
function generateSecurePassword(length = 10) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  
  // Ensure at least one character from each category
  password += charset.match(/[A-Z]/)[0]; // Uppercase
  password += charset.match(/[a-z]/)[0]; // Lowercase
  password += charset.match(/[0-9]/)[0]; // Number
  password += charset.match(/[!@#$%^&*()]/)[0]; // Special char
  
  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

export async function autoCreateAccount(name, email) {
  try {
    // Check if user already exists (simple check)
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (existingUser) {
        return { success: true, message: "User already exists", userExists: true };
      }
    } catch (checkError) {
      console.warn("Unable to check if user exists:", checkError);
    }
    
    // Generate a secure password
    const tempPassword = generateSecurePassword(12);
    
    // Create the account
    const { data: userData, error: signupError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          full_name: name
        }
      }
    });
    
    if (signupError) throw signupError;
    
    // Store the temp password in your database for later retrieval
    // IMPORTANT: Hash this in production or use a token system
    const { error: storeError } = await supabase
      .from('temp_credentials')
      .insert({
        user_id: userData.user.id,
        email: email,
        temp_password: tempPassword, // In production, encrypt this!
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
      
    if (storeError) {
      console.warn("Failed to store temp password:", storeError);
    }
    
    return { 
      success: true, 
      user: userData?.user, 
      message: "Account created successfully. Check email for verification link."
    };
  } catch (error) {
    console.error("Auto-account creation failed:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}