const { registerBlockType } = wp.blocks;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, Spinner, Button, TextControl } = wp.components;
const { useState, useRef, useEffect } = wp.element;

const FilterableDropdown = ({ options, selectedValue, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const dropdownRef = useRef(null);

    // Update filtered options based on search input
    useEffect(() => {
        setFilteredOptions(
            options.filter(option =>
                option.label.toLowerCase().includes(searchInput.toLowerCase())
            )
        );
    }, [searchInput, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="filterable-dropdown" ref={dropdownRef}>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                isSecondary
                aria-expanded={isOpen}
            >
                {selectedValue ? options.find(option => option.value === selectedValue)?.label : "Select Collection"}
            </Button>
            {isOpen && (
                <div className="dropdown-menu">
                    <TextControl
                        value={searchInput}
                        onChange={setSearchInput}
                        placeholder="Type to search..."
                    />
                    <ul>
                        {filteredOptions.length ? (
                            filteredOptions.map(option => (
                                <li
                                    key={option.value}
                                    onClick={() => {
                                        onSelect(option.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    {option.label}
                                </li>
                            ))
                        ) : (
                            <li>No options available</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

registerBlockType('best-seller/book-genre', {
    title: 'Book Genre',
    icon: 'book',
    category: 'widgets',
    attributes: {
        title: {
            type: 'string',
            default: 'Bestsellers'
        },
        genre: {
            type: 'string',
            default: ''
        },
        book: {
            type: 'string',
            default: ''
        }
    },
    edit: (props) => {
        const { attributes: { title, genre, book }, setAttributes } = props;
        const [genres, setGenres] = useState([
            { label: 'Select a Genre', value: '' } // Initial placeholder
        ]);
        const [books, setBooks] = useState([
            { label: 'Select a Book', value: '' } // Initial placeholder
        ]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            fetch('https://api-test.penguinrandomhouse.com/resources/v2/title/domains/PRH.UK/categories?api_key=qx4hfd2x6r4re89tbkxga2hy&rows=100')
                .then(response => response.json())
                .then(data => {
                    // Check for valid data structure
                    if (data && data.data && data.data.categories) {
                        // Filter genres based on the desired `catSetId`
                        const fetchedGenres = data.data.categories
                            //.filter(category => category.catSetId === 'PW') // Ensure this field exists and matches 'PW'
                            .map(category => ({
                                label: category.menuText, // Adjust as needed
                                value: category.catUri    // Ensure `catId` is the correct identifier
                            }));
                        setGenres(fetchedGenres);
                        setLoading(false);
                    } else {
                        throw new Error('Invalid data structure received.');
                    }
                })
                .catch(err => {
                    console.error('Error fetching genres:', err);
                    setError('Failed to load genres.');
                    setLoading(false);
                });
        }, []);

        // Fetch books when genre changes
        useEffect(() => {
            if (!genre) return;

            setBooks([{ label: 'Loading books...', value: '' }]); // Show loading state for books
            fetch(`https://api-test.penguinrandomhouse.com/resources/v2/title/domains/PRH.UK/works/views/list-display?api_key=qx4hfd2x6r4re89tbkxga2hy&rows=0&sort=weeklySales&dir=desc&catUri=${genre}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.data && data.data.works) {
                        const fetchedBooks = data.data.works.map(book => ({
                            label: book.title,
                            value: book.workId
                        }));
                        setBooks(fetchedBooks);
                    } else {
                        throw new Error('Invalid data structure received.');
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching books:', err);
                    setBooks([{ label: 'Failed to load books', value: '' }]);
                    setLoading(false);
                });
        }, [genre]);

        const handleGenreSelect = (selectedGenre) => {
            setAttributes({ genre: selectedGenre });
            setAttributes({ book: '' });
        };

        const handleBookSelect = (newBook) => {
            setAttributes({ book: newBook });
        };


        // const onChangeGenre = (newGenre) => {
        //     setAttributes({ genre: newGenre });       
        //     setAttributes({ book: '' }); // Reset selected book
        // };
        
        // const onChangeBook = (newBook) => {
        //     setAttributes({ book: newBook });
        // };

        if (loading) {
            return <Spinner />;
        }

        if (error) {
            return <p>{error}</p>;
        }
        return (
            <>
                <InspectorControls>
                    <PanelBody title="Block Options">
                        <TextControl
                            label="Title"
                            value={title}
                            onChange={(newTitle) => setAttributes({ title: newTitle })}
                            placeholder="Enter title..."
                        />
                        <FilterableDropdown
                            options={genres}
                            selectedValue={genre}
                            onSelect={handleGenreSelect}
                        />
                        {genre && (
                            <FilterableDropdown
                                options={books}
                                selectedValue={book}
                                onSelect={handleBookSelect}
                            />
                        )}
                    </PanelBody>
                </InspectorControls>
                <div>
                    <h2>{title}</h2> {/* Display the title */}
                    <strong>Selected Genre:</strong> {genre ? genre : 'No genre selected'}
                    <br />
                    <strong>Selected Book:</strong> {book ? book : 'No book selected'}
                </div>
            </>
        );
    },
    save: (props) => {
        const { attributes: { title, genre, book } } = props;
        return (
            <div>
                <h2>{title}</h2> {/* Display the title */}
                <strong>Genre:</strong> {genre ? genre : 'No genre selected'}
                <br />
                <strong>Book:</strong> {book ? book : 'No book selected'}
            </div>
        );
    }
});
