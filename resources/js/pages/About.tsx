import Layout from "../components/Layout";
import {Title} from "@solidjs/meta";

export default function About() {
    return (
        <div>
            <Title>About SSR</Title>
            <h1>About</h1>
            <p>This is the about page.</p>
        </div>
    )
}

About.layout = Layout
