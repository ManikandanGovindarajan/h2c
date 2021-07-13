import Form from "@myCompany/form";
import { Label, InputBox, Field, Button } from "@myCompany/form-elements";

export const SampleFeedBackComponent = () => {
    return (
        <div>
            <div>Please give your feedback, it means a lot to us</div>

            <Form name="'feedBack'"><ul>
                <li >
                    <Label for="userName" />
                    <InputBox name="userName" />
                </li>
                <li>
                    <label for="mail">E-mail:</label>
                    <Field name="emailId" type="emailId" />
                </li>
                <li>
                    <label for="msg">Message:</label>
                    <textarea id="msg" name="user_message"></textarea>
                </li>
            </ul>
                <Button name="Submit" colour="green" size="small" />
            </Form>

        </div>
    );
}

export default SampleFeedBackComponent;