'use client'

import { useState, useEffect } from 'react';

const URL_API = 'https://games-test-api-81e9fb0d564a.herokuapp.com/api/data/';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [genres, setGenres] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchDataWithTimeout = (timeout) => {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('O servidor demorou para responder. Tente mais tarde.'));
            }, timeout);

            try {
                const response = await fetch(URL_API, {
                    headers: {
                        'dev-email-address': '9marceli@gmail.com'
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.status}`);
                }

                const data = await response.json();
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await fetchDataWithTimeout(5000);
            setData(data);
            extractGenres(data);
        } catch (error) {
            if (
                [500, 502, 503, 504, 507, 508, 509].includes(
                    Number(error.message.slice(-3))
                )
            ) {
                setErrorMessage('O servidor falhou em responder. Tente recarregar a página.');
            } else {
                setErrorMessage(
                    'O servidor não conseguirá responder por agora. Tente novamente mais tarde.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const extractGenres = (data) => {
        const uniqueGenres = Array.from(new Set(data.map((item) => item.genre)));
        setGenres(uniqueGenres);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleGenreChange = (e) => {
        setSelectedGenre(e.target.value);
    };

    const filteredData = data
        ? data.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const filteredDataByGenre = selectedGenre
        ? filteredData.filter((item) => item.genre === selectedGenre)
        : filteredData;

    const showNoResults = searchTerm.length > 0 && filteredDataByGenre.length === 0;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            {loading && !data && (
                <div className="flex items-center justify-center">
                    <p className="font-bold text-center">Carregando informações...</p>
                </div>
            )}
            {errorMessage && (
                <p className="text-red-500 text-center mb-4 font-bold">{errorMessage}</p>
            )}
            {data && !errorMessage && (
                <>
                    <div className="flex flex-col items-center mb-4 mt-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Buscar por título"
                            className="p-2 border border-gray-300 rounded w-auto mb-2 sm:w-auto"
                        />
                        <select
                            value={selectedGenre}
                            onChange={handleGenreChange}
                            className="p-2 border border-gray-300 rounded w-auto sm:w-auto"
                        >
                            <option value="">Todos os gêneros</option>
                            {genres.map((genre, index) => (
                                <option key={index} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredDataByGenre.map((item, index) => (
                                <div key={index} className="p-4 flex flex-col items-center">
                                    <img src={item.thumbnail} alt="Thumbnail" className="mb-2" />
                                    <p className="text-center">{item.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {showNoResults && (
                        <div className="flex flex-col justify-center mb-10 h-1/2">
                            <p className="text-center text-gray-500">Nenhum resultado encontrado.</p>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
