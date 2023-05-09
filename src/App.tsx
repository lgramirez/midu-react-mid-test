import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { SortBy, type User } from './types.d';
import { UsersList } from './components/UsersList';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [isColoredRows, setIsColoredRows] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE);
  const [filterCountry, setFilterCountry] = useState<string | null>(null);
  // no usamos estados porque el estado esta pensado
  // para cuando cambien, se rederize de nuevo la UI
  // const [originalUsers, setOriginalUsers] = useState<User[]>([]);

  // useremos el useRef para guardar un valor
  // que queremos compartir entre renderizados
  // pero que al cambiar, no vuelva a renderizar el componente
  const originalUsers = useRef<User[]>([]);

  const toggleColoredRows = () => {
    setIsColoredRows(!isColoredRows);
  };

  const toggleSortCountries = () => {
    const newSorting = sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE;
    setSorting(newSorting);
  };

  // const filteredUsers =
  //   filterCountry != null && filterCountry.length > 0
  //     ? users.filter((user) => {
  //         return user.location.country
  //           .toLowerCase()
  //           .includes(filterCountry.toLowerCase());
  //       })
  //     : users;

  // se usa el [...] para que no mute el array original
  // const sortedUsers = areCountriesSorted
  //   ? [...users].sort((a, b) => {
  //       return a.location.country.localeCompare(b.location.country);
  //     })
  //   : users;

  // usaremos las nuevas funciones de JS
  // toSorted hace lo mismo que sort pero no muta array
  // const sortedUsers = areCountriesSorted
  //   ? filteredUsers.toSorted((a, b) => {
  //       return a.location.country.localeCompare(b.location.country);
  //     })
  //   : filteredUsers;

  // useMemo
  const filteredUsers = useMemo(
    () =>
      filterCountry != null && filterCountry.length > 0
        ? users.filter((user) => {
            console.log('filter');
            return user.location.country
              .toLowerCase()
              .includes(filterCountry.toLowerCase());
          })
        : users,
    [users, filterCountry]
  );

  const sortedUsers = useMemo(() => {
    if (sorting === SortBy.NONE) return filteredUsers;

    const compareProperties: Record<string, (a: User, b: User) => number> = {
      [SortBy.NAME]: (a: User, b: User) =>
        a.name.first.localeCompare(b.name.first),
      [SortBy.LAST]: (a: User, b: User) =>
        a.name.last.localeCompare(b.name.last),
      [SortBy.COUNTRY]: (a: User, b: User) =>
        a.location.country.localeCompare(b.location.country),
    };

    return filteredUsers.toSorted((a, b) => {
      return compareProperties[sorting](a, b);
    });
  }, [filteredUsers, sorting]);

  const handleDelete = (emailToDelete: string) => {
    const filteredUsers = users.filter((user) => {
      return emailToDelete !== user.email;
    });

    setUsers(filteredUsers);
  };

  const handleReset = () => {
    setUsers(originalUsers.current);
  };

  const handleChangeSorting = (sort: SortBy) => {
    setSorting(sort);
  };

  useEffect(() => {
    fetch('https://randomuser.me/api?results=100')
      .then(async (res) => await res.json())
      .then((res) => {
        setUsers(res.results);
        originalUsers.current = res.results;
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className='App'>
      <h1>Prueba Tecnica</h1>
      <header>
        <button onClick={toggleColoredRows}>Color rows</button>
        <button onClick={toggleSortCountries}>
          {sorting === SortBy.COUNTRY
            ? 'Do not sort Countries'
            : 'Sort Countries'}
        </button>
        <button onClick={handleReset}>Reset Users</button>
        <input
          type='text'
          placeholder='Filter by Country'
          onChange={(e) => {
            setFilterCountry(e.target.value);
          }}
        />
      </header>
      <main>
        <UsersList
          deleteUser={handleDelete}
          users={sortedUsers}
          colorRows={isColoredRows}
          changeSorting={handleChangeSorting}
        />
      </main>
    </div>
  );
}

export default App;
