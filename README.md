# CSV Merger

A powerful, browser-based tool for merging multiple CSV files. Process your data privately and securely - all operations happen in your browser, ensuring your files never leave your computer.

![CSV Merger Screenshot](https://github.com/ca2datavision/ca2-csv-merger/raw/main/screenshot.png)

## Features

- 🔒 100% Private: All processing happens in your browser
- 📱 Responsive design: Works on desktop and mobile devices
- 🎯 Easy to use: Simple drag & drop interface
- 🔄 Reorder files: Arrange files in your preferred order
- 👀 Preview support: View file contents before merging
- 📊 Column handling: Automatically handles different column structures
- 💾 Download results: Get your merged CSV file instantly

## Usage

1. Visit [CSV Merger](https://tools.ca2datavision.ro/csv-merger/)
2. Drag & drop your CSV files or click to select them
3. Arrange files in your desired order
4. Preview individual files or the merged result
5. Download the merged CSV file

## Development

### Prerequisites

- Node.js 20 or later
- npm 10 or later

### Setup

```bash
# Clone the repository
git clone https://github.com/ca2datavision/ca2-csv-merger.git
cd ca2-csv-merger

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Docker

Build and run using Docker:

```bash
# Build the image
docker build -t csv-merger .

# Run the container
docker run -p 8080:80 csv-merger
```

The application will be available at `http://localhost:8080/csv-merger/`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For support or inquiries, please email [ionut@ca2datavision.ro](mailto:ionut@ca2datavision.ro).

## Disclaimer

This software is provided "as is", without warranty of any kind. The creators and contributors assume no responsibility for any errors or issues that may arise from its use.