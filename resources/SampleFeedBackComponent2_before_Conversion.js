export const SampleFeedBackComponent = () => {
    return (
        <div>
            <div>Please give your feedback, it means a lot to us</div>

            <form class="form"> 
                <ul>
                    <li >
                        <div class="form-element">
                            <label class="input-label" for="input-9">outlined</label>
                            <div class="text text--outlined text--md">
                                <div class="text-field-wrapper">
                                    <input class="text__box" type="text" placeholder="Search"  value="" />
                                </div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div class="form-element">
                            <label class="input-label" for="input-9">outlined</label>
                            <div class="text text--outlined text--md">
                                <div class="text-field-wrapper">
                                    <input class="text__box" type="text" placeholder="Search"  value="" />
                                </div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div class="form-element"  tabindex="0" aria-haspopup="listbox">
                            <div class="text select text--underlined text--md">
                                <label class="input-label" for="select-51">
                                    SelectWrapper Label
                                </label>
                                <div class="text-field-wrapper">
                                    <span class="text__box select__box" data-placeholder="">hurray</span>
                                    <div class="text__adorn select__arrow">
                                        <i class="ci-arrow-bottom "></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>

                </ul>

                <button type="button" class="btn btn--btn btn--md btn--filled btn--primary " tabindex="0">
                    <span class="btn__text">Submit</span>
                </button>
            </form>

        </div>
    );
}

export default SampleFeedBackComponent;