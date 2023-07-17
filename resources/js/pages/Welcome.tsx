import { createSignal } from 'solid-js'
import Layout from "../components/Layout";
import {Title} from "@solidjs/meta";

export default function Welcome() {
    const [count, setCount] = createSignal(0);

    return (
        <div>
            <Title>Hello SSR!</Title>
            <h1>Hello world!!!!</h1>
            <div>
                <button onClick={() => setCount((count) => count - 1)}>-</button>
                <span>{count()}</span>
                <button onClick={() => setCount((count) => count + 1)}>+</button>
            </div>
        </div>
    )
}

Welcome.layout = Layout
