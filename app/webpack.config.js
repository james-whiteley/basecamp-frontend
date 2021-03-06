const path = require("path")

module.exports = {
  entry: {
    bundle: "./src/index.js",
    trix: "./src/trix.js"
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public")
  },

  mode: "production",
  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/
        ],
        use: [
          { loader: "babel-loader" }
        ]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  }
}
