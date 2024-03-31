import passport from "passport";
import Strategy from "passport-local";
import { getUser } from "../modules/es-data-mem.mjs";
import {checkCredentials} from "../modules/seca-services.mjs";

/**
 * Define the passport strategy that is going to be used
 */
passport.use(
    new Strategy(
        {
            usernameField: "username",
            passwordField: "password",
        },
        async (username, password, done) => {

            try {
                if (!username || !password) throw new Error("Bad request. Missing credentials");
                const user = await getUser(username);
                if (!user) throw new Error("User not found");
                const isValid = await checkCredentials(username, password);
                if (isValid) {
                    done(null, user);
                }
                else {
                    done(null, null);
                }
            }
            catch (error) {
                console.error(error.message);
                done(error, null);
            }
        }
    )
)

/**
 * Serialize and deserialize the user
 */
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
