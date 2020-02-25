const express = require('express');
const Users = require('./userDb.js');
const Posts = require('../posts/postDb.js');
const router = express.Router();

router.post('/', validateUser, (req, res) => {
  Users.insert(req.body)
    .then(response => {
      res.status(201).json({message: 'New user has been created.'});
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({error: 'There was an error creating a new user'});
    });
  
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
  const postBody = { user_id: req.params.id, text: req.body.text}
 
  Posts.insert(postBody)
    .then(response => {
      res.status(201).json(response);
    })
    .catch(error => {
      res.status(500).json({error: 'There was an error creating a new post.'})
    });
  
});

router.get('/', (req, res) => {
  Users.get()
    .then(results => {
      res.status(200).json(results);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({error: 'There was an error retrieving user information'});
    });
});

router.get('/:id', validateUserId, (req, res) => {
  res.status(200).json(req.user);
});

router.get('/:id/posts', validateUserId, (req, res) => {
  const { id } = req.params;

  Users.getUserPosts(id)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(error => {
      res.status(500).json({error: 'There was an error retrieving these messages.'});
    });
});

router.delete('/:id', validateUserId, (req, res) => {
  const { id } = req.params;
  Users.remove(id)
    .then(response => {
      res.status(200).json({message: `Successfully deleted ${response} records.`})
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({error: 'There was an error deleting the requested record.'});
    });
});

router.put('/:id', validateUserId, validateUser, (req, res) => {
  const { id } = req.params;

  Users.update(id, req.body)
    .then(response => {
      res.status(202).json({message: `${response} record(s) have been updated.`});
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({error: 'There was an error updating the current user.'});
    });
});

//custom middleware

function validateUserId(req, res, next) {
  // do your magic!
  const { id } = req.params;
  
  Users.getById(id)
    .then(user => {
      if (user) {
        req.user = user;
        next();
      } else {
        res
          .status(400)
          .json({ error: 'Invalid user ID.' });
      }
    })
    .catch(error => {
      console.log(error);
      res
        .status(500)
        .json({ error: 'Server error validating user ID' });
    });
};


function validateUser(req, res, next) {
  function isEmpty(obj) {
    for(let key in obj) {
      if(obj.hasOwnProperty(key))
        return false;
    } 
      return true;
  };

  if(isEmpty(req.body)) {
    res.status(400).json({ error: "Missing user data." });
  } else {
    if (!req.body.name) {
      res.status(400).json({ error: "Missing required name field." });
    } else if (req.body) {
        next();
    }
  };
};

function validatePost(req, res, next) {
  function isEmpty(obj) {
    for(let key in obj) {
      if(obj.hasOwnProperty(key))
        return false;
    } 
      return true;
  };

  if(isEmpty(req.body)) {
    res.status(400).json({ error: "Missing post data." });
  } else {
    if (!req.body.text) {
      res.status(400).json({ error: "Missing required text field." });
    } else if (req.body) {
        next();
    }
  };
};

module.exports = router;
