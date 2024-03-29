const express = require("express"),
      passport = require("passport");

const passportService = require("./config/passport");
const AuthenticationController = require("./controllers/authentication");
const SongController = require("./controllers/song");
const ArtistController = require("./controllers/artist");
const PlaylistController = require("./controllers/playlist");
const ChannelController = require("./controllers/channel");

const requireAuth = passport.authenticate("jwt", { session: false });
const requireLogin = passport.authenticate("local", { session: false });
const requireOptional = passport.authenticate(["jwt", "anonymous"], { session: false });

// Constants for role types
const ROLE_ADMIN = "Admin",  
//   REQUIRE_OWNER = "Owner",
//   REQUIRE_CLIENT = "Client",
     ROLE_MEMBER = "Member";

const requireRole = (role) => {
      return (req, res, next) => {
            if (req.user.role === role) return next();
            else return res.status(403).send("You are not permitted to perform this action.");
      };
};

module.exports = function(app) {
    // Initialize Route Groups
    const apiRoutes = express.Router(),
          authRoutes = express.Router(),
          songRoutes = express.Router(),
          artistRoutes = express.Router(),
          channelRoutes = express.Router(),
          playlistRoutes = express.Router();

    //====================================
    // Auth Routes
    //====================================

    // Set up auth routes as subgroup / middleware to apiRoutes
    apiRoutes.use("/auth", authRoutes);

    authRoutes.post("/login", requireLogin, AuthenticationController.login);
    authRoutes.post("/register", AuthenticationController.register);
    authRoutes.post("/refreshToken", AuthenticationController.refreshToken);

    //====================================
    // Song Routes
    //====================================
    apiRoutes.use("/song", songRoutes);
    songRoutes.get("/", requireAuth, SongController.get);
    songRoutes.post("/create", requireAuth, requireRole(ROLE_ADMIN), SongController.create);
    songRoutes.get("/pending", requireAuth, requireRole(ROLE_ADMIN), SongController.getPending);
    songRoutes.post("/updatestatus", requireAuth, requireRole(ROLE_ADMIN), SongController.updateStatus);
    songRoutes.post("/updatetitle", requireAuth, requireRole(ROLE_ADMIN), SongController.updateTitle);
    songRoutes.post("/updateartist", requireAuth, requireRole(ROLE_ADMIN), SongController.updateArtist);

    //====================================
    // Artist Routes
    //====================================
    apiRoutes.use("/artist", artistRoutes);
    artistRoutes.get("/", requireAuth, ArtistController.get);

    //====================================
    // Channel Routes
    //====================================
    apiRoutes.use("/channel", channelRoutes);
    channelRoutes.get("/", requireAuth, requireRole(ROLE_ADMIN), ChannelController.get);
    channelRoutes.post("/create", requireAuth, requireRole(ROLE_ADMIN), ChannelController.create);
    channelRoutes.post("/sync", requireAuth, requireRole(ROLE_ADMIN), ChannelController.sync);

    //====================================
    // Playlist Routes
    //====================================
    apiRoutes.use("/playlist", playlistRoutes);
    playlistRoutes.get("/", requireAuth, PlaylistController.get);
    playlistRoutes.post("/create", requireAuth, PlaylistController.create);
    playlistRoutes.delete("/", requireAuth, PlaylistController.delete);
    playlistRoutes.post("/addsong", requireAuth, PlaylistController.addSongToPlaylist);
    playlistRoutes.post("/removesong", requireAuth, PlaylistController.removeSongFromPlaylist);
    playlistRoutes.post("/rename", requireAuth, PlaylistController.renamePlaylist);
    
    // Set URL for API group routes
    app.use("/api", apiRoutes);
}