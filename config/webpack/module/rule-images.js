module.exports = {
  test: /\.(jpg|png|svg)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: './images/[name].[ext]'
    }
  }
}
