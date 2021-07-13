export const SampleFeedBackComponent = () => {
    return (
        <div>
            <div>Please give your feedback, it means a lot to us</div>

            <form data-h2c="Form::@myCompany/form::name='feedBack'">
                <ul>
                    <li >
                        <label
                            data-h2c="{Label}::@myCompany/form-elements::for=userName"
                            for="userName">Name:</label>
                        <input
                            data-h2c="{InputBox}::@myCompany/form-elements::name=userName"
                            type="text" id="name" name="userName" />
                    </li>
                    <li>
                        <label for="mail">E-mail:</label>
                        <input
                            data-h2c="{Field}::@myCompany/form-elements::name=emailId,type=emailId"
                            type="email" id="mail" name="userEmail" />
                    </li>
                    <li data-h2c>
                        <label for="msg">Message:</label>
                        <textarea id="msg" name="user_message"></textarea>
                    </li>
                </ul>

                <button
                    data-h2c="{Button}::@myCompany/form-elements::name=Submit,colour=green,size=small"
                >Submit</button>
            </form>

        </div>
    );
}

export default SampleFeedBackComponent;