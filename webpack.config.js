// Node.js file path module
const path = require('path')

// Load the plugin to auto-inject scrip tags into our index.html
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Define the default export as a function instead of an object.
// This allows customization of the config depending on the mode.
module.exports = (env, argv) => {
  // Buid up the base webpack configuration
  const config = {
    // List all possible entry points (js file generated for each)
    entry: {
      app: path.join(__dirname, 'src/main.jsx'),
      vendor: ['react', 'react-dom', '@material-ui/core']
    },

    // What should the output be named and where should it be placed
    output: {
      filename: '[name].bundle.js',
      path: path.join(__dirname, 'public')
    },

    // Enabling splitting of the bundle
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: 'initial',
            name: 'vendor',
            test: 'vendor',
            enforce: true
          }
        }
      }
    },

    // Define rules for how to process each type of file
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react'
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader', options: { modules: true } }
          ]
        },
        { test: /\.md$/, use: { loader: 'raw-loader' } }
      ]
    },

    // Configure any other options or plugins
    plugins: [
      // Inject script tags into our index.html file
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src/index.html'),
        filename: path.join(__dirname, 'public/index.html')
      })
    ]
  }

  // Add things that should only be there in 'production' mode
  if (argv.mode === 'production') {
    config.module.rules[0].use.options.presets.push('minify')
  }

  // Add things that should only be there in 'development' mode
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map'
  }

  if (argv.mode !== 'deployment') {
    config.devServer = {
      contentBase: path.join(__dirname, 'public'),
      compress: true,
      port: 9000
    }
  }

  // Return the final configuraiton
  return config
}
