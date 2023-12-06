require(['jquery','core/ajax'], function($, ajax) {

  // -----------------------------
  $(document).ready(function() {

    //  toggle event
  function cunton() {
      // get current value then call ajax to get new data
      ajax.call([{
        methodname: 'core_course_get_recent_courses',
        args: {
          userid: '2'
        },
      }])[0].done(function(response) {
        // clear out old values
                console.log(response);
                console.log($(response));

        var data = JSON.parse(response);
        return;
      }).fail(function(err) {
        console.log(err);
        //notification.exception(new Error('Failed to load data'));
        return;
      });

    };

cunton();

  });
});

//The above absolutely works, don't mess with it.

require(['jquery','core/ajax'], function($, ajax) {

  // -----------------------------
  $(document).ready(function() {

    //  toggle event
  function cunton() {
      // get current value then call ajax to get new data
      ajax.call([{
        methodname: 'core_course_get_course_content_items',
        args: {
          userid: '2'
        },
      }])[0].done(function(response) {
        // clear out old values
                console.log(response);
                console.log($(response));

        var data = JSON.parse(response);
        return;
      }).fail(function(err) {
        console.log(err);
        //notification.exception(new Error('Failed to load data'));
        return;
      });

    };

cunton();

  });
});