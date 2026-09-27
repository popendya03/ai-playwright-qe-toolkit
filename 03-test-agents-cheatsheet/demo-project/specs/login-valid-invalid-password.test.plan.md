# Login Valid and Invalid Password Test Plan

## Application Overview

Test the login page at https://practice.expandtesting.com/login with the published valid credentials and with a valid username plus an incorrect password. Each scenario starts in a fresh browser context with no authenticated session. Successful login should reach /secure; an incorrect password should remain on /login and show the site's observed password error alert.

## Test Scenarios

### 1. Login authentication

**Seed:** `tests/seed.spec.ts`

#### 1.1. Log in with valid credentials

**File:** `tests/login-check/valid-login.spec.ts`

**Steps:**
  1. Start a fresh browser context and navigate to https://practice.expandtesting.com/login.
    - expect: The page title is "Test Login Page for Automation Testing Practice".
    - expect: The login form has visible Username and Password fields and a Login button.
    - expect: The page lists the valid credentials username `practice` and password `SuperSecretPassword!`.
  2. Fill Username with `practice` and Password with `SuperSecretPassword!`, then click Login.
    - expect: The browser is redirected to https://practice.expandtesting.com/secure.
    - expect: A success alert with the exact text "You logged into a secure area!" is visible.
    - expect: The secure area greets the user with "Hi, practice!".
    - expect: A Logout link is visible.

#### 1.2. Reject a valid username with an invalid password

**File:** `tests/login-check/invalid-password.spec.ts`

**Steps:**
  1. Start a separate fresh browser context and navigate to https://practice.expandtesting.com/login.
    - expect: The login page and its Username, Password, and Login controls are visible.
    - expect: No authenticated session is present.
  2. Fill Username with `practice` and Password with `WrongPassword`, then click Login.
    - expect: The browser remains on https://practice.expandtesting.com/login.
    - expect: An error alert with the exact observed text "Your password is invalid!" is visible.
    - expect: The secure area greeting and Logout link are not visible.
    - expect: The user is not authenticated.
