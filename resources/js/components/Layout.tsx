import {Link} from "inertia-adapter-solid";
import {ParentProps} from "solid-js";

export default function Layout(props: ParentProps) {
    return (
        <>
            <nav>
                <ul>
                    <li>
                        <Link href='/'>Welcome</Link>
                    </li>
                    <li>
                        <Link href='/about'>About</Link>
                    </li>
                </ul>
            </nav>
            {props.children}
        </>
    )
}
