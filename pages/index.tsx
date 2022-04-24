import React from "react";
import Link from "next/link";

import { useCollection } from "@nandorojo/swr-firestore";
import compose from "lodash/fp/compose";
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
} from "next-firebase-auth";

import { getTodos } from "./api/todos";

import { withNotifications } from "../components/withNotifications";
import { GeolocationContext } from "../components/GeolocationProvider";
import { Todo } from "../types";

type Props = {
  todos: Todo[];
};

const Home: React.FC<Props> = ({ todos }) => {
  const user = useAuthUser();
  const geolocation = React.useContext(GeolocationContext);

  const { data, add } = useCollection<Todo, any>(
    user.id ? "todos" : null,
    {
      where: ["userId", "==", user.id],
    },
    { initialData: todos, revalidateOnMount: true }
  );
  return (
    <>
      <button onClick={() => alert(JSON.stringify(geolocation))}>
        my location
      </button>
      <button onClick={() => user.signOut()}>sign out</button>
      <Link href="/map">
        <button>map</button>
      </Link>
      <Link href="/harmonogram">
        <button>harmonogram</button>
      </Link>
      <ol>
        {data?.map((todo, key) => (
          <li key={key}>{todo.title}</li>
        ))}
      </ol>
    </>
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }) => {
  const todos = AuthUser.id && (await getTodos(AuthUser.id));
  return { props: { ["todos"]: todos } };
});

export default compose(
  withAuthUser({
    whenUnauthedBeforeInit: AuthAction.RETURN_NULL,
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  }),
  withNotifications
)(Home);
