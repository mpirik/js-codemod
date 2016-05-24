module.exports = function (file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const shortHandMethods = root
    .find(j.Property, {
      method: true,
      computed: false
    });

  const result = root
    .find(j.Function, {
      generator: false,
      async: false
    })
    // We check for this expression, as if it's in a function expression, we don't want to re-bind "this" by
    // using the arrowFunctionExpression. As that could potentially have some unintended consequences.
    .filter(p => {
      // If the function has a name, skip converting it to arrow function
      if (p.value.id && p.value.id.name) {
        return false;
      }

      // If the function is a shorthand method definitions, skip
      if (p.name === 'value') {
        return false;
      }

      const path = j(p);
      const containsThisExpression = path.find(j.ThisExpression).size();
      if (containsThisExpression) {
        console.log('contains this - skipping');
        return false;
      }

      const hasShortHandMethod = shortHandMethods.filter((shortHandMethod) => {
        if (shortHandMethod.value) {
          // console.log(shortHandMethod.value);
          if (shortHandMethod.value && shortHandMethod.value.value.start === p.value.start && shortHandMethod.value.value.end === p.value.end) {
            return true;
          }
        }

        return false;
      }).size();

      return !hasShortHandMethod;
    })
    .replaceWith(p => {
      var body = p.value.body;
      var useExpression = false;
      // We can get a bit clever here. If we have a function that consists of a single return statement in it's body,
      // we can transform it to the more compact arrowFunctionExpression (a, b) => a + b, vs (a + b) => { return a + b }
      if (body.type == 'BlockStatement' && body.body.length == 1) {
        /*if (body.body[0].type === 'ExpressionStatement') {
         body = body.body[0].expression;
         } else*/
        if (body.body[0].type === 'ReturnStatement') {
          body = body.body[0].argument;
          useExpression = true;
        }
      }

      var params = p.value.params;
      if (params.length === 1) {
        params.push({
          type: 'Identifier',
          name: 'thisIsNotAValidParamAndShouldBeRemoved'
        });
      }

      return j.arrowFunctionExpression(p.value.params, body, useExpression);
    });

  return result.toSource();
};
