function validateForm() {
    var firstName = document.getElementById("firstname").value;
    var lastName = document.getElementById("firstname").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    // Regular expressions for validation
    var alphaRegex = /^[a-zA-Z]+$/;
    var upperRegex = /[A-Z]/;
    var specialRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    var numericRegex = /[0-9]/;

    if (!alphaRegex.test(firstName)) {
        alert("First name should contain only alphabetic characters!");
        return false;
    }

    if (!alphaRegex.test(lastName)) {
        alert("Last name should contain only alphabetic characters!");
        return false;
    }

    if (!upperRegex.test(password)) {
        alert("Password should contain at least one uppercase letter!");
        return false;
    }

    if (!specialRegex.test(password)) {
        alert("Password should contain at least one special character!");
        return false;
    }

    if (!numericRegex.test(password)) {
        alert("Password should contain at least one numerical character!");
        return false;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return false;
    }

    return true;
}