const express = require('express');
const Posts = require('./postDb.js');

const router = express.Router();

router.get('/', (req, res) => {
  Posts.get()
    .then(results => {
      res.status(200).json(results);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({error: 'There was an error retrieving post information'});
    });
});

router.get('/:id', validatePostId, (req, res) => {
  res.status(200).json(req.post);
});

router.delete('/:id', validatePostId, (req, res) => {
  const { id } = req.params;
  
  Posts.remove(id)
    .then(response => {
      res.status(200).json({message: `Successfully deleted ${response} records.`})
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({error: 'There was an error deleting the requested record.'});
    });
});

router.put('/:id', validatePostId, validatePost, (req, res) => {
   
  Posts.update(req.params.id, req.body)
    .then(response => {
      res.status(201).json(response);
    })
    .catch(error => {
      res.status(500).json({error: 'There was an error updating this post.'})
    });
});

// custom middleware

function validatePostId(req, res, next) {
  const { id } = req.params;
  
  Posts.getById(id)
    .then(post => {
      if (post) {
        req.post = post;
        next();
      } else {
        res
          .status(400)
          .json({ error: 'Invalid post ID.' });
      }
    })
    .catch(error => {
      console.log(error);
      res
        .status(500)
        .json({ error: 'Server error validating post ID' });
    });
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
